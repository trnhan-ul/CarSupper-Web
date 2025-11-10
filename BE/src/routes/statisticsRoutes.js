const express = require("express");
const router = express.Router();
const {
  getSummary,
  getOrderStatus,
  getRevenueAnalytics,
  getCustomerInsights,
  getCategoryPerformance,
  getOrderTrends,
  getDashboardOverview,
} = require("../controllers/statisticsController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// Dashboard overview (comprehensive stats)
router.get("/dashboard", verifyToken, adminMiddleware, getDashboardOverview);

// Basic statistics
router.get("/summary", verifyToken, adminMiddleware, getSummary);
router.get("/order-status", verifyToken, adminMiddleware, getOrderStatus);

// Advanced analytics
router.get("/revenue", verifyToken, adminMiddleware, getRevenueAnalytics);
router.get("/customers", verifyToken, adminMiddleware, getCustomerInsights);
router.get("/categories", verifyToken, adminMiddleware, getCategoryPerformance);
router.get("/order-trends", verifyToken, adminMiddleware, getOrderTrends);

module.exports = router;
