const express = require("express");
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, getClasses, createClass } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/classes", protect, getClasses);
router.post("/classes", protect, authorize("admin"), createClass);
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
