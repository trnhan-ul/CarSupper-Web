const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// Get summary statistics
const getSummary = async (req, res) => {
  try {
    const [totalOrders, totalRevenueResult, totalProducts, totalUsers] =
      await Promise.all([
        Order.countDocuments({ status: "done" }),
        Order.aggregate([
          { $match: { status: "done" } },
          { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
        ]),
        Product.countDocuments(),
        User.countDocuments(),
      ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      summary: {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order status counts
const getOrderStatus = async (req, res) => {
  try {
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, orderStatus: orderStatusCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard overview
const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get current period stats (last 30 days)
    const [
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      totalProducts,
      activeProducts,
      totalUsers,
      newUsers,
    ] = await Promise.all([
      // Current period revenue
      Order.aggregate([
        { $match: { status: "done", createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Previous period revenue
      Order.aggregate([
        {
          $match: {
            status: "done",
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Current period orders
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      // Previous period orders
      Order.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      // Total products
      Product.countDocuments(),
      // Active products
      Product.countDocuments({ status: "active" }),
      // Total users
      User.countDocuments(),
      // New users last 30 days
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const currentRevenueTotal = currentRevenue[0]?.total || 0;
    const previousRevenueTotal = previousRevenue[0]?.total || 0;

    // Calculate growth percentages
    const revenueGrowth =
      previousRevenueTotal > 0
        ? (
            ((currentRevenueTotal - previousRevenueTotal) /
              previousRevenueTotal) *
            100
          ).toFixed(2)
        : 0;

    const ordersGrowth =
      previousOrders > 0
        ? (((currentOrders - previousOrders) / previousOrders) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      overview: {
        revenue: {
          current: currentRevenueTotal,
          previous: previousRevenueTotal,
          growth: parseFloat(revenueGrowth),
        },
        orders: {
          current: currentOrders,
          previous: previousOrders,
          growth: parseFloat(ordersGrowth),
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        users: {
          total: totalUsers,
          newLast30Days: newUsers,
        },
      },
      period: {
        current: {
          start: thirtyDaysAgo.toISOString(),
          end: today.toISOString(),
        },
        previous: {
          start: sixtyDaysAgo.toISOString(),
          end: thirtyDaysAgo.toISOString(),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard overview",
      error: error.message,
    });
  }
};

module.exports = {
  getSummary,
  getOrderStatus,
  getDashboardOverview,
};
