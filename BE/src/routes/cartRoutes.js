const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getMyCart,
  addToCartSimple,
  removeCartItemSimple,
  clearMyCart,
} = require("../controllers/cartController");

// Lấy giỏ hàng của user đăng nhập
router.get("/", verifyToken, getMyCart);

// Thêm xe vào giỏ: body { productId }
router.post("/", verifyToken, addToCartSimple);

// Xóa 1 xe theo productId
router.delete("/:productId", verifyToken, removeCartItemSimple);

// Xóa sạch giỏ hàng
router.delete("/", verifyToken, clearMyCart);

module.exports = router;
