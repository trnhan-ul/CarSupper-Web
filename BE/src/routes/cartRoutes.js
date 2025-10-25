const express = require("express");
const router = express.Router();
const { verifyToken, canModifyUser } = require("../middleware/authMiddleware");
const {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

router.get("/:userId", verifyToken, canModifyUser, getCartByUserId);
router.post("/:userId", verifyToken, canModifyUser, addToCart);
router.put("/:userId", verifyToken, canModifyUser, updateCartItem);
router.delete("/:userId", verifyToken, canModifyUser, removeCartItem);
router.delete("/clear/:userId", verifyToken, canModifyUser, clearCart);

module.exports = router;
