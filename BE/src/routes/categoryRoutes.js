const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");

// Lấy tất cả categories trả về dạng mảng trực tiếp
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" });
    res.json(categories); // CHỈ TRẢ MẢNG!
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Lấy 1 category theo id
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Tạo mới category
router.post("/", async (req, res) => {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cập nhật category
router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cập nhật status riêng (PATCH)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Category.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Xóa category
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
