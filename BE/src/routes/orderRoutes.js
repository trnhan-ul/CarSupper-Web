const express = require("express");
const {
  verifyToken,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const {
  updateOrderStatusByAdmin,
  cancelOrderByUser,
  addOrderFeedback,
  createOrder,
  getOrdersByUser,
  getAllOrders,
  softDeleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/all", verifyToken, adminMiddleware, getAllOrders);
router.put("/status", verifyToken, adminMiddleware, updateOrderStatusByAdmin);
router.put("/cancel", verifyToken, cancelOrderByUser);
router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getOrdersByUser);
router.put("/:id/feedback", verifyToken, addOrderFeedback);
router.delete("/:id", verifyToken, adminMiddleware, softDeleteOrder);

module.exports = router;
