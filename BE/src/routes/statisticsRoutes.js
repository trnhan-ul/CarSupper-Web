const express = require("express");
const router = express.Router();
const {
  getSummary,
  getOrderStatus,
  getDashboardOverview,
} = require("../controllers/statisticsController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// Dashboard overview (comprehensive stats with growth metrics)
router.get("/dashboard", verifyToken, adminMiddleware, getDashboardOverview);

// Summary statistics (total counts and revenue)
router.get("/summary", verifyToken, adminMiddleware, getSummary);

// Order status distribution
router.get("/order-status", verifyToken, adminMiddleware, getOrderStatus);

module.exports = router;
