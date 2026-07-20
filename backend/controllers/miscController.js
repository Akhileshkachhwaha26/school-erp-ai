const asyncHandler = require("express-async-handler");
const { Notice, Leave, StudyMaterial } = require("../models/Misc");

const createNotice = asyncHandler(async (req, res) => {
  const { title, message, audience, classId, attachment } = req.body;
  const notice = await Notice.create({ title, message, audience: audience || "all", class: classId, attachment, createdBy: req.user._id });
  res.status(201).json({ success: true, notice });
});

const getNotices = asyncHandler(async (req, res) => {
  const roleAudienceMap = { student: "students", parent: "parents", teacher: "teachers", admin: "all" };
  const audience = roleAudienceMap[req.user.role];
  const filter = { $or: [{ audience: "all" }, { audience }] };
  const notices = await Notice.find(filter).populate("createdBy", "name role").sort({ createdAt: -1 });
  res.json({ success: true, notices });
});

const applyLeave = asyncHandler(async (req, res) => {
  const { fromDate, toDate, reason } = req.body;
  const leave = await Leave.create({ applicant: req.user._id, applicantRole: req.user.role, fromDate, toDate, reason });
  res.status(201).json({ success: true, leave });
});

const getLeaves = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (req.user.role === "student" || req.user.role === "teacher") filter.applicant = req.user._id;
  const leaves = await Leave.find(filter).populate("applicant", "name role").sort({ createdAt: -1 });
  res.json({ success: true, leaves });
});

const reviewLeave = asyncHandler(async (req, res) => {
  const { status, reviewRemarks } = req.body;
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error("Leave application not found");
  }
  leave.status = status;
  leave.reviewRemarks = reviewRemarks;
  leave.reviewedBy = req.user._id;
  await leave.save();
  res.json({ success: true, leave });
});

const uploadStudyMaterial = asyncHandler(async (req, res) => {
  const { title, subject, classId, fileUrl, publicId, fileType } = req.body;
  const material = await StudyMaterial.create({ title, subject, class: classId, fileUrl, publicId, fileType, uploadedBy: req.user._id });
  res.status(201).json({ success: true, material });
});

const getStudyMaterials = asyncHandler(async (req, res) => {
  const { classId, subject } = req.query;
  const filter = {};
  if (classId) filter.class = classId;
  if (subject) filter.subject = subject;
  const materials = await StudyMaterial.find(filter).populate("uploadedBy", "name").sort({ createdAt: -1 });
  res.json({ success: true, materials });
});

module.exports = { createNotice, getNotices, applyLeave, getLeaves, reviewLeave, uploadStudyMaterial, getStudyMaterials };
