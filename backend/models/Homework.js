const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [{ url: String, publicId: String, name: String }],
    dueDate: { type: Date, required: true },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        submittedAt: { type: Date, default: Date.now },
        attachment: { url: String, publicId: String, name: String },
        status: { type: String, enum: ["submitted", "late", "graded"], default: "submitted" },
        grade: { type: String },
        feedback: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homework", homeworkSchema);
