const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Class = require("../models/Class");

const getUsers = asyncHandler(async (req, res) => {
  const { role, classId, search } = req.query;

  // Non-admins may only use this endpoint to search people by name (e.g. for
  // messaging) — full unfiltered listing/browsing stays admin-only.
  if (req.user.role !== "admin" && !search) {
    res.status(403);
    throw new Error("Not authorized to browse all users");
  }

  const filter = {};
  if (role) filter.role = role;
  if (classId) filter["studentProfile.classId"] = classId;
  if (search) filter.name = { $regex: search, $options: "i" };
  const users = await User.find(filter).select("-password").populate("studentProfile.classId", "name section").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("studentProfile.classId", "name section")
    .populate("studentProfile.parent", "name email phone")
    .populate("parentProfile.children", "name");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const allowedFields = ["name", "phone", "avatar", "studentProfile", "teacherProfile", "parentProfile", "isActive"];
  allowedFields.forEach((field) => { if (req.body[field] !== undefined) user[field] = req.body[field]; });
  await user.save();
  res.json({ success: true, user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: "User deactivated" });
});

const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find().populate("classTeacher", "name email").populate("students", "name studentProfile.rollNumber");
  res.json({ success: true, classes });
});

const createClass = asyncHandler(async (req, res) => {
  const { name, section, classTeacher, subjects } = req.body;
  const newClass = await Class.create({ name, section, classTeacher, subjects });
  res.status(201).json({ success: true, class: newClass });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser, getClasses, createClass };
