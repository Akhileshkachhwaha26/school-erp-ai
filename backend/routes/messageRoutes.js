const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, asyncHandler(async (req, res) => {
  const { receiver, content } = req.body;
  const message = await Message.create({ sender: req.user._id, receiver, content });
  res.status(201).json({ success: true, message });
}));

router.get("/:userId", protect, asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });
  await Message.updateMany({ sender: req.params.userId, receiver: req.user._id, read: false }, { $set: { read: true } });
  res.json({ success: true, messages });
}));

router.get("/", protect, asyncHandler(async (req, res) => {
  const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
    .populate("sender", "name role").populate("receiver", "name role").sort({ createdAt: -1 });

  const conversationMap = new Map();
  messages.forEach((m) => {
    const other = m.sender._id.toString() === req.user._id.toString() ? m.receiver : m.sender;
    if (!conversationMap.has(other._id.toString())) {
      conversationMap.set(other._id.toString(), { user: other, lastMessage: m.content, lastAt: m.createdAt });
    }
  });
  res.json({ success: true, conversations: Array.from(conversationMap.values()) });
}));

module.exports = router;
