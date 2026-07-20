const express = require("express");
const router = express.Router();
const {
  createNotice, getNotices, applyLeave, getLeaves, reviewLeave, uploadStudyMaterial, getStudyMaterials,
} = require("../controllers/miscController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/notices", protect, authorize("admin", "teacher"), createNotice);
router.get("/notices", protect, getNotices);

router.post("/leaves", protect, authorize("student", "teacher"), applyLeave);
router.get("/leaves", protect, getLeaves);
router.put("/leaves/:id/review", protect, authorize("admin", "teacher"), reviewLeave);

router.post("/study-materials", protect, authorize("teacher", "admin"), uploadStudyMaterial);
router.get("/study-materials", protect, getStudyMaterials);

module.exports = router;
