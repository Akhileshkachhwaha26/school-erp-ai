const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename, originalName: req.file.originalname });
});

module.exports = router;
