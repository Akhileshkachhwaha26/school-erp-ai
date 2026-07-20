const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ["all", "students", "parents", "teachers"], default: "all" },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attachment: { url: String, publicId: String },
  },
  { timestamps: true }
);

const leaveSchema = new mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicantRole: { type: String, enum: ["student", "teacher"], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewRemarks: { type: String },
  },
  { timestamps: true }
);

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String },
    fileType: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  Notice: mongoose.model("Notice", noticeSchema),
  Leave: mongoose.model("Leave", leaveSchema),
  StudyMaterial: mongoose.model("StudyMaterial", studyMaterialSchema),
};
