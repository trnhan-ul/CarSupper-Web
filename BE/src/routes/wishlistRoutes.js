const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
    clearWishlist,
    checkInWishlist,
} = require("../controllers/wishlistController");

// Lấy wishlist của user đăng nhập
router.get("/", verifyToken, getMyWishlist);

// Thêm sản phẩm vào wishlist
router.post("/", verifyToken, addToWishlist);

// Kiểm tra product có trong wishlist không
router.get("/check/:productId", verifyToken, checkInWishlist);

// Xóa sản phẩm khỏi wishlist
router.delete("/:productId", verifyToken, removeFromWishlist);

// Xóa toàn bộ wishlist
router.delete("/", verifyToken, clearWishlist);

module.exports = router;
