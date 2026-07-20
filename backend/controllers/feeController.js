const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Fee = require("../models/Fee");
const User = require("../models/User");

const getRazorpayInstance = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const createFee = asyncHandler(async (req, res) => {
  const { student, classId, feeType, amount, dueDate } = req.body;
  const fee = await Fee.create({ student, class: classId, feeType, amount, dueDate });
  res.status(201).json({ success: true, fee });
});

// Assign the same fee to every student in a class in one go
const createBulkFee = asyncHandler(async (req, res) => {
  const { classId, feeType, amount, dueDate } = req.body;
  if (!classId || !feeType || !amount || !dueDate) {
    res.status(400);
    throw new Error("classId, feeType, amount and dueDate are required");
  }
  const students = await User.find({ role: "student", "studentProfile.classId": classId }).select("_id");
  if (students.length === 0) {
    res.status(404);
    throw new Error("No students found in this class");
  }
  const fees = await Fee.insertMany(
    students.map((s) => ({ student: s._id, class: classId, feeType, amount, dueDate }))
  );
  res.status(201).json({ success: true, count: fees.length, fees });
});

const getStudentFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find({ student: req.params.studentId }).sort({ dueDate: 1 });
  res.json({ success: true, fees });
});

const getAllFees = asyncHandler(async (req, res) => {
  const { status, classId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (classId) filter.class = classId;
  const fees = await Fee.find(filter).populate("student", "name studentProfile.rollNumber").populate("class", "name section").sort({ dueDate: 1 });
  res.json({ success: true, fees });
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.feeId);
  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }
  if (fee.status === "paid") {
    res.status(400);
    throw new Error("This fee has already been paid");
  }
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "your_razorpay_key_id") {
    res.status(503);
    throw new Error("Online payments are not configured yet. Please contact the school office.");
  }
  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({ amount: fee.amount * 100, currency: "INR", receipt: `fee_${fee._id}` });
  fee.razorpayOrderId = order.id;
  await fee.save();
  res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const fee = await Fee.findById(req.params.feeId);
  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }
  const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed - signature mismatch");
  }
  fee.status = "paid";
  fee.paidAt = new Date();
  fee.razorpayPaymentId = razorpay_payment_id;
  fee.paymentMethod = "online";
  await fee.save();
  res.json({ success: true, message: "Payment verified successfully", fee });
});

module.exports = { createFee, createBulkFee, getStudentFees, getAllFees, createPaymentOrder, verifyPayment };
