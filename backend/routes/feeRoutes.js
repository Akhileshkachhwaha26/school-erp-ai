const express = require("express");
const router = express.Router();
const { createFee, createBulkFee, getStudentFees, getAllFees, createPaymentOrder, verifyPayment } = require("../controllers/feeController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("admin"), createFee);
router.post("/bulk", protect, authorize("admin"), createBulkFee);
router.get("/", protect, authorize("admin"), getAllFees);
router.get("/student/:studentId", protect, getStudentFees);
router.post("/:feeId/create-order", protect, authorize("student", "parent"), createPaymentOrder);
router.post("/:feeId/verify-payment", protect, authorize("student", "parent"), verifyPayment);

module.exports = router;
