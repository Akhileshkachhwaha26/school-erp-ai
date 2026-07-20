const express = require("express");
const router = express.Router();
const { createHomework, getHomework, getHomeworkById, submitHomework, gradeSubmission } = require("../controllers/homeworkController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("teacher", "admin"), createHomework);
router.get("/", protect, getHomework);
router.get("/:id", protect, getHomeworkById);
router.post("/:id/submit", protect, authorize("student"), submitHomework);
router.put("/:id/grade/:studentId", protect, authorize("teacher", "admin"), gradeSubmission);

module.exports = router;
