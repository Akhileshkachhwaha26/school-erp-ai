require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Class = require("../models/Class");
const Fee = require("../models/Fee");
const { Exam, Result } = require("../models/Exam");

const seed = async () => {
  await connectDB();

  console.log("Clearing existing demo data...");
  await User.deleteMany({});
  await Class.deleteMany({});
  await Fee.deleteMany({});
  await Exam.deleteMany({});
  await Result.deleteMany({});

  console.log("Creating class...");
  const class10A = await Class.create({
    name: "Class 10", section: "A",
    subjects: ["Mathematics", "Science", "English", "Social Studies"],
  });

  console.log("Creating admin...");
  await User.create({ name: "School Admin", email: "admin@school.com", password: "admin123", role: "admin", phone: "9999999999" });

  console.log("Creating teacher...");
  const teacher = await User.create({
    name: "Mrs. Sharma", email: "teacher@school.com", password: "teacher123", role: "teacher", phone: "9888888888",
    teacherProfile: { employeeId: "EMP001", subjects: ["Mathematics", "Science"], classesAssigned: [class10A._id], qualification: "M.Sc, B.Ed" },
  });

  console.log("Creating parent...");
  const parent = await User.create({ name: "Mr. Verma", email: "parent@school.com", password: "parent123", role: "parent", phone: "9777777777", parentProfile: { occupation: "Engineer" } });

  console.log("Creating student...");
  const student = await User.create({
    name: "Rahul Verma", email: "student@school.com", password: "student123", role: "student",
    studentProfile: { classId: class10A._id, rollNumber: "10A-01", admissionNumber: "ADM2026001", parent: parent._id },
  });

  parent.parentProfile.children = [student._id];
  await parent.save();

  class10A.classTeacher = teacher._id;
  class10A.students = [student._id];
  await class10A.save();

  console.log("Creating sample fee records...");
  await Fee.create([
    { student: student._id, class: class10A._id, feeType: "Tuition Fee - Q1", amount: 15000, dueDate: new Date("2026-08-15"), status: "pending" },
    { student: student._id, class: class10A._id, feeType: "Transport Fee - Q1", amount: 3000, dueDate: new Date("2026-07-01"), status: "paid", paidAt: new Date() },
  ]);

  console.log("Creating a sample exam with published result...");
  const exam = await Exam.create({
    title: "Mid-Term Exam 2026", class: class10A._id, subject: "Mathematics", date: new Date("2026-06-15"),
    totalMarks: 100, passingMarks: 33, createdBy: teacher._id, resultsPublished: true,
  });
  await Result.create({ exam: exam._id, student: student._id, marksObtained: 82, grade: "A", remarks: "Excellent work" });

  console.log("\n✅ Seed complete! Demo login credentials:\n");
  console.log("  Admin:   admin@school.com / admin123");
  console.log("  Teacher: teacher@school.com / teacher123");
  console.log("  Parent:  parent@school.com / parent123");
  console.log("  Student: student@school.com / student123\n");

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
