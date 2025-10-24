const express = require("express");
const router = express.Router();
const {
  getSummary,
  getOrderStatus,
} = require("../controllers/statisticsController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.get("/summary", verifyToken, adminMiddleware, getSummary);

router.get("/order-status", verifyToken, adminMiddleware, getOrderStatus);

module.exports = router;
