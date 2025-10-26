const express = require("express");
const {
  verifyToken,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const {
  updateCategory,
  updateCategoryStatus,
  createCategory,
  getAllCategories,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/all", getAllCategories);
router.post("/", verifyToken, adminMiddleware, createCategory);
router.put("/:id/status", verifyToken, adminMiddleware, updateCategoryStatus);
router.put("/:id", verifyToken, adminMiddleware, updateCategory);

module.exports = router;
