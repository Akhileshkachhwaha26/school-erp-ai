const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["admin", "teacher", "student", "parent"], required: true },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    studentProfile: {
      classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      rollNumber: { type: String },
      admissionNumber: { type: String },
      dateOfBirth: { type: Date },
      parent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    teacherProfile: {
      employeeId: { type: String },
      subjects: [{ type: String }],
      classesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
      qualification: { type: String },
    },
    parentProfile: {
      children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      occupation: { type: String },
    },

    fcmToken: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
