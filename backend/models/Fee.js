const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    feeType: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
    paidAt: { type: Date },
    paymentMethod: { type: String, enum: ["online", "cash", "cheque"], default: "online" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
