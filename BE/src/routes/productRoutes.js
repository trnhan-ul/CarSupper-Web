const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");

// Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Lấy chi tiết 1 sản phẩm theo ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Thêm mới sản phẩm
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const data = await newProduct.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Cập nhật sản phẩm
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Xoá sản phẩm
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
