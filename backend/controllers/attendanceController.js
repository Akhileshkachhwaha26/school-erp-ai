const asyncHandler = require("express-async-handler");
const Attendance = require("../models/Attendance");

const markAttendance = asyncHandler(async (req, res) => {
  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records)) {
    res.status(400);
    throw new Error("classId, date, and records array are required");
  }
  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, date: new Date(date) },
      update: {
        $set: {
          student: r.student, class: classId, date: new Date(date),
          status: r.status, remarks: r.remarks || "", markedBy: req.user._id, method: r.method || "manual",
        },
      },
      upsert: true,
    },
  }));
  await Attendance.bulkWrite(ops);
  res.status(201).json({ success: true, message: `Attendance marked for ${records.length} students` });
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { student: req.params.studentId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const records = await Attendance.find(filter).sort({ date: -1 });
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
  res.json({ success: true, records, summary: { total, present, percentage } });
});

const getClassAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    res.status(400);
    throw new Error("date query param is required");
  }
  const records = await Attendance.find({ class: req.params.classId, date: new Date(date) })
    .populate("student", "name studentProfile.rollNumber");
  res.json({ success: true, records });
});

module.exports = { markAttendance, getStudentAttendance, getClassAttendance };
