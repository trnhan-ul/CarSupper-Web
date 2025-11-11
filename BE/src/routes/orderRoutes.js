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
  getOrderById,
  getAllFeedbacks,
} = require("../controllers/orderController");

const router = express.Router();

// Admin
router.get("/all", verifyToken, adminMiddleware, getAllOrders);
router.get("/feedbacks/all", verifyToken, adminMiddleware, getAllFeedbacks);
router.patch("/status", verifyToken, adminMiddleware, updateOrderStatusByAdmin);
router.delete("/:id", verifyToken, adminMiddleware, softDeleteOrder);

// User
router.get("/", verifyToken, getOrdersByUser);
router.get("/:id", verifyToken, getOrderById); // Route mới
router.put("/cancel", verifyToken, cancelOrderByUser);
router.post("/", verifyToken, createOrder);
router.put("/:id/feedback", verifyToken, addOrderFeedback);

module.exports = router;
