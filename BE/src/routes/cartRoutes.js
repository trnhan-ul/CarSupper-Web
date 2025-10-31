const express = require("express");
const router = express.Router();
const { verifyToken, customerOnly } = require("../middleware/authMiddleware");
const {
  getMyCart,
  addToCartSimple,
  removeCartItemSimple,
  clearMyCart,
} = require("../controllers/cartController");

// Lấy giỏ hàng của user đăng nhập
router.get("/", verifyToken, customerOnly, getMyCart);

// Thêm xe vào giỏ: body { productId }
router.post("/", verifyToken, customerOnly, addToCartSimple);

// Xóa 1 xe theo productId
router.delete("/:productId", verifyToken, customerOnly, removeCartItemSimple);

// Xóa sạch giỏ hàng
router.delete("/", verifyToken, customerOnly, clearMyCart);

module.exports = router;
