const express = require("express");
const router = express.Router();
const { createExam, getExams, publishResults, getStudentResults } = require("../controllers/examController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("teacher", "admin"), createExam);
router.get("/", protect, getExams);
router.post("/:examId/results", protect, authorize("teacher", "admin"), publishResults);
router.get("/results/student/:studentId", protect, getStudentResults);

module.exports = router;
