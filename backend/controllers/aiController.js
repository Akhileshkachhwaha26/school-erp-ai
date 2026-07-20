const asyncHandler = require("express-async-handler");
const Attendance = require("../models/Attendance");
const { Result } = require("../models/Exam");
const Homework = require("../models/Homework");
const User = require("../models/User");

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key") {
    throw new Error("GEMINI_API_KEY is not configured. Get a free key at https://aistudio.google.com/app/apikey and add it to backend/.env");
  }
  const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini API request failed");
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
};

const doubtSolver = asyncHandler(async (req, res) => {
  const { question, subject } = req.body;
  if (!question) {
    res.status(400);
    throw new Error("Question is required");
  }
  const prompt = `You are a friendly, patient school tutor helping a student understand a concept.
Subject: ${subject || "General"}
Student's question: ${question}

Give a clear, age-appropriate explanation. Break it into simple steps if it's a problem to solve. Keep it encouraging. Show the working for numeric problems rather than just the final answer.`;
  const answer = await callGemini(prompt);
  res.json({ success: true, answer });
});

const homeworkAssistant = asyncHandler(async (req, res) => {
  const { homeworkId, query } = req.body;
  const homework = await Homework.findById(homeworkId);
  if (!homework) {
    res.status(404);
    throw new Error("Homework not found");
  }
  const prompt = `You are an AI homework assistant for a school student. Help them understand their assignment without doing it for them directly.

Assignment title: ${homework.title}
Subject: ${homework.subject}
Assignment description: ${homework.description}

Student's specific question: ${query || "Can you help me understand what this assignment is asking me to do?"}

Provide guidance, hints, and explanations of relevant concepts. Encourage independent thinking. Do not write the final submission for them.`;
  const answer = await callGemini(prompt);
  res.json({ success: true, answer });
});

const performanceAnalysis = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await User.findById(studentId).select("name studentProfile");
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  const attendanceRecords = await Attendance.find({ student: studentId });
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((r) => r.status === "present").length;
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "N/A";

  const results = await Result.find({ student: studentId }).populate("exam", "title subject totalMarks");
  const resultsSummary = results.map((r) => `${r.exam?.subject || "Unknown"} (${r.exam?.title || ""}): ${r.marksObtained}/${r.exam?.totalMarks || "?"}`);

  const homeworkAll = await Homework.find({ "submissions.student": studentId });
  const submittedCount = homeworkAll.filter((h) => h.submissions.some((s) => s.student.toString() === studentId)).length;

  const prompt = `You are an AI academic analyst for a school. Analyze this student's data and produce a concise performance summary for parents/teachers.

Student name: ${student.name}
Attendance: ${presentDays}/${totalDays} days present (${attendancePercentage}%)
Exam results: ${resultsSummary.length > 0 ? resultsSummary.join(", ") : "No results recorded yet"}
Homework submitted: ${submittedCount} assignments

Provide: 1) An overall performance summary (2-3 sentences) 2) Key strengths 3) Areas needing attention or risk flags 4) One actionable recommendation. Keep the tone constructive and supportive.`;

  const analysis = await callGemini(prompt);
  res.json({ success: true, studentName: student.name, rawData: { attendancePercentage, totalDays, presentDays, resultsSummary, submittedCount }, aiAnalysis: analysis });
});

const generateReportCard = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await User.findById(studentId).select("name studentProfile");
  const results = await Result.find({ student: studentId }).populate("exam", "title subject totalMarks passingMarks");
  if (results.length === 0) {
    res.status(400);
    throw new Error("No published results found for this student yet");
  }
  const lines = results.map((r) => `${r.exam.subject}: ${r.marksObtained}/${r.exam.totalMarks} (Pass mark: ${r.exam.passingMarks})`);
  const prompt = `Generate a formal academic report card summary paragraph for a school report card.

Student: ${student.name}
Subject-wise results:
${lines.join("\n")}

Write a professional, encouraging 3-4 sentence report card remark summarizing overall performance, highlighting the strongest subject, and noting one area for improvement.`;
  const remark = await callGemini(prompt);
  res.json({ success: true, studentName: student.name, results: lines, reportCardRemark: remark });
});

const attendanceRiskAnalysis = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const students = await User.find({ "studentProfile.classId": classId, role: "student" }).select("name");
  const riskData = [];
  for (const s of students) {
    const records = await Attendance.find({ student: s._id });
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const percentage = total > 0 ? (present / total) * 100 : 100;
    riskData.push({ studentId: s._id, name: s.name, percentage: percentage.toFixed(1) });
  }
  const atRisk = riskData.filter((r) => parseFloat(r.percentage) < 75);
  res.json({ success: true, totalStudents: students.length, atRiskCount: atRisk.length, atRiskStudents: atRisk, allStudents: riskData });
});

const aiChatbot = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }
  const prompt = `You are the AI assistant for a school ERP system called "School ERP & LMS". You help students, parents, and teachers with general questions about using the platform (attendance, homework, fees, exams, notices) and general school-related queries. Be concise and friendly, 2-4 sentences max unless more detail is truly needed.

User role: ${req.user.role}
User message: ${message}`;
  const reply = await callGemini(prompt);
  res.json({ success: true, reply });
});

module.exports = { doubtSolver, homeworkAssistant, performanceAnalysis, generateReportCard, attendanceRiskAnalysis, aiChatbot };
