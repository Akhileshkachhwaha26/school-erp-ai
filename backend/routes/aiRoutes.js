const express = require("express");
const router = express.Router();
const {
  doubtSolver, homeworkAssistant, performanceAnalysis, generateReportCard, attendanceRiskAnalysis, aiChatbot,
} = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/doubt-solver", protect, authorize("student"), doubtSolver);
router.post("/homework-assistant", protect, authorize("student"), homeworkAssistant);
router.get("/performance-analysis/:studentId", protect, performanceAnalysis);
router.get("/report-card/:studentId", protect, authorize("teacher", "admin"), generateReportCard);
router.get("/attendance-risk/:classId", protect, authorize("teacher", "admin"), attendanceRiskAnalysis);
router.post("/chatbot", protect, aiChatbot);

module.exports = router;
