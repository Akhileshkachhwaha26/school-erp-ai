const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resultsPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const resultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    marksObtained: { type: Number, required: true },
    grade: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

resultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = {
  Exam: mongoose.model("Exam", examSchema),
  Result: mongoose.model("Result", resultSchema),
};
