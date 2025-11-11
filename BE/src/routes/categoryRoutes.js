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
  getCategoryById,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", verifyToken, adminMiddleware, createCategory);
router.patch("/:id/status", verifyToken, adminMiddleware, updateCategoryStatus);
router.put("/:id", verifyToken, adminMiddleware, updateCategory);
router.delete("/:id", verifyToken, adminMiddleware, deleteCategory);

module.exports = router;
