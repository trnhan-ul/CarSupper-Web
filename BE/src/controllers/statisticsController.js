const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const getSummary = async (req, res) => {
  try {
    const [totalOrders, totalRevenueResult, totalProducts, totalUsers] = await Promise.all([
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

module.exports = {
  getSummary,
  getOrderStatus,
};
