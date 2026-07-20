const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, studentProfile, teacherProfile, parentProfile } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Please provide name, email, password and role");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }
  const user = await User.create({ name, email, password, role, phone, studentProfile, teacherProfile, parentProfile });
  res.status(201).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id, user.role),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been deactivated. Contact the school admin.");
  }
  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    token: generateToken(user._id, user.role),
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("studentProfile.classId", "name section")
    .populate("studentProfile.parent", "name email phone")
    .populate("parentProfile.children", "name studentProfile.rollNumber studentProfile.classId");
  res.json({ success: true, user });
});

const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  await User.findByIdAndUpdate(req.user._id, { fcmToken });
  res.json({ success: true, message: "FCM token updated" });
});

module.exports = { registerUser, loginUser, getMe, updateFcmToken };
