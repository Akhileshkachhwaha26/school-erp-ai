const express = require("express");
const router = express.Router();
const { markAttendance, getStudentAttendance, getClassAttendance } = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("teacher", "admin"), markAttendance);
router.get("/student/:studentId", protect, getStudentAttendance);
router.get("/class/:classId", protect, authorize("teacher", "admin"), getClassAttendance);

module.exports = router;
