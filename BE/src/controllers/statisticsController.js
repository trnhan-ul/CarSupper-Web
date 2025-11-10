const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");

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

// Revenue analytics with date range and grouping
const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    // Validate groupBy parameter
    const validGroupBy = ["day", "month", "year"];
    const groupByPeriod = validGroupBy.includes(groupBy) ? groupBy : "day";

    // Build match filter for date range
    let matchFilter = { status: "done" };

    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) {
        matchFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // Include entire end date
        matchFilter.createdAt.$lte = endDateTime;
      }
    }

    // Define grouping based on period
    let dateGrouping;
    switch (groupByPeriod) {
      case "month":
        dateGrouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      case "year":
        dateGrouping = {
          year: { $year: "$createdAt" },
        };
        break;
      default: // day
        dateGrouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    const revenueData = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: dateGrouping,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Calculate total revenue for the period
    const totalRevenue = revenueData.reduce(
      (sum, item) => sum + item.totalRevenue,
      0
    );
    const totalOrders = revenueData.reduce(
      (sum, item) => sum + item.totalOrders,
      0
    );

    res.status(200).json({
      success: true,
      data: revenueData,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        period: groupByPeriod,
      },
      filters: {
        startDate,
        endDate,
        groupBy: groupByPeriod,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching revenue analytics",
      error: error.message,
    });
  }
};

// Get customer insights
const getCustomerInsights = async (req, res) => {
  try {
    const { limit } = req.query;
    const customerLimit = parseInt(limit) || 10;

    // Get top customers by total spent
    const topCustomers = await Order.aggregate([
      { $match: { status: "done" } },
      {
        $group: {
          _id: "$userId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: customerLimit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 1,
          customerName: "$userInfo.fullName",
          customerEmail: "$userInfo.email",
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: 1,
        },
      },
    ]);

    // Get new customers statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomersCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const totalCustomers = await User.countDocuments();

    res.status(200).json({
      success: true,
      topCustomers,
      statistics: {
        totalCustomers,
        newCustomersLast30Days: newCustomersCount,
        topCustomersCount: topCustomers.length,
      },
      message: `Top ${customerLimit} customers by total spent`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customer insights",
      error: error.message,
    });
  }
};

// Get category performance
const getCategoryPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = { status: "done" };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDateTime;
      }
    }

    const categoryStats = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo._id",
          categoryName: { $first: "$categoryInfo.name" },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$items.price" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Calculate total for percentages
    const totalRevenue = categoryStats.reduce(
      (sum, cat) => sum + cat.totalRevenue,
      0
    );

    // Add percentage to each category
    const categoryStatsWithPercentage = categoryStats.map((cat) => ({
      ...cat,
      revenuePercentage:
        totalRevenue > 0
          ? ((cat.totalRevenue / totalRevenue) * 100).toFixed(2)
          : 0,
    }));

    res.status(200).json({
      success: true,
      data: categoryStatsWithPercentage,
      summary: {
        totalCategories: categoryStats.length,
        totalRevenue,
      },
      filters: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category performance",
      error: error.message,
    });
  }
};

// Get order trends over time
const getOrderTrends = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const validGroupBy = ["day", "month", "year"];
    const groupByPeriod = validGroupBy.includes(groupBy) ? groupBy : "day";

    // Build match filter
    let matchFilter = {};
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        matchFilter.createdAt.$lte = endDateTime;
      }
    }

    // Define grouping
    let dateGrouping;
    switch (groupByPeriod) {
      case "month":
        dateGrouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      case "year":
        dateGrouping = {
          year: { $year: "$createdAt" },
        };
        break;
      default:
        dateGrouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    const orderTrends = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            period: dateGrouping,
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.period.year": 1,
          "_id.period.month": 1,
          "_id.period.day": 1,
        },
      },
      {
        $group: {
          _id: "$_id.period",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          totalOrders: { $sum: "$count" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: orderTrends,
      filters: {
        startDate,
        endDate,
        groupBy: groupByPeriod,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order trends",
      error: error.message,
    });
  }
};

// Get dashboard overview (comprehensive stats)
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
  getRevenueAnalytics,
  getCustomerInsights,
  getCategoryPerformance,
  getOrderTrends,
  getDashboardOverview,
};
