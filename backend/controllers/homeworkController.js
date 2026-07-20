const asyncHandler = require("express-async-handler");
const Homework = require("../models/Homework");

const createHomework = asyncHandler(async (req, res) => {
  const { title, description, subject, classId, dueDate, attachments } = req.body;
  const homework = await Homework.create({
    title, description, subject, class: classId, dueDate,
    attachments: attachments || [], createdBy: req.user._id,
  });
  res.status(201).json({ success: true, homework });
});

const getHomework = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const filter = {};
  if (classId) filter.class = classId;
  const homework = await Homework.find(filter).populate("createdBy", "name").populate("class", "name section").sort({ createdAt: -1 });
  res.json({ success: true, homework });
});

const getHomeworkById = asyncHandler(async (req, res) => {
  const homework = await Homework.findById(req.params.id)
    .populate("createdBy", "name").populate("class", "name section")
    .populate("submissions.student", "name studentProfile.rollNumber");
  if (!homework) {
    res.status(404);
    throw new Error("Homework not found");
  }
  res.json({ success: true, homework });
});

const submitHomework = asyncHandler(async (req, res) => {
  const homework = await Homework.findById(req.params.id);
  if (!homework) {
    res.status(404);
    throw new Error("Homework not found");
  }
  const { attachment } = req.body;
  const isLate = new Date() > new Date(homework.dueDate);
  const existing = homework.submissions.find((s) => s.student.toString() === req.user._id.toString());
  if (existing) {
    existing.attachment = attachment;
    existing.submittedAt = new Date();
    existing.status = isLate ? "late" : "submitted";
  } else {
    homework.submissions.push({ student: req.user._id, attachment, status: isLate ? "late" : "submitted" });
  }
  await homework.save();
  res.json({ success: true, message: "Homework submitted", homework });
});

const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;
  const homework = await Homework.findById(req.params.id);
  if (!homework) {
    res.status(404);
    throw new Error("Homework not found");
  }
  const submission = homework.submissions.find((s) => s.student.toString() === req.params.studentId);
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found for this student");
  }
  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = "graded";
  await homework.save();
  res.json({ success: true, message: "Submission graded" });
});

module.exports = { createHomework, getHomework, getHomeworkById, submitHomework, gradeSubmission };
