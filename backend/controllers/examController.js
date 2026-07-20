const asyncHandler = require("express-async-handler");
const { Exam, Result } = require("../models/Exam");

const createExam = asyncHandler(async (req, res) => {
  const { title, classId, subject, date, startTime, endTime, totalMarks, passingMarks } = req.body;
  const exam = await Exam.create({ title, class: classId, subject, date, startTime, endTime, totalMarks, passingMarks, createdBy: req.user._id });
  res.status(201).json({ success: true, exam });
});

const getExams = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const filter = {};
  if (classId) filter.class = classId;
  const exams = await Exam.find(filter).populate("class", "name section").sort({ date: 1 });
  res.json({ success: true, exams });
});

const publishResults = asyncHandler(async (req, res) => {
  const { results } = req.body;
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  const ops = results.map((r) => ({
    updateOne: { filter: { exam: exam._id, student: r.student }, update: { $set: { ...r, exam: exam._id } }, upsert: true },
  }));
  await Result.bulkWrite(ops);
  exam.resultsPublished = true;
  await exam.save();
  res.json({ success: true, message: `Results published for ${results.length} students` });
});

const getStudentResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ student: req.params.studentId })
    .populate({ path: "exam", select: "title subject date totalMarks passingMarks resultsPublished", match: { resultsPublished: true } })
    .sort({ createdAt: -1 });
  const published = results.filter((r) => r.exam !== null);
  res.json({ success: true, results: published });
});

module.exports = { createExam, getExams, publishResults, getStudentResults };
