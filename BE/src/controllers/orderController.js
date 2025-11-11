const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const createOrder = async (req, res) => {
  try {
    const userId = (req.user && req.user._id) || req.body.userId;
    const { items, shippingAddress, note, shippingCost = 0 } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    let subTotal = 0;
    const orderItems = [];
    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${it.productId} not found` });
      }
      const price = product.discountPrice !== 0 ? product.discountPrice : product.price;
      subTotal += price;
      orderItems.push({ productId: product._id, price });
    }

    const totalAmount = subTotal + Number(shippingCost || 0);

    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      note,
      shippingCost: Number(shippingCost || 0),
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    const purchasedIds = new Set(items.map((i) => i.productId.toString()));
    if (cart && Array.isArray(cart.items)) {
      cart.items = cart.items.filter((ci) => !purchasedIds.has(ci.productId.toString()));
      if (cart.items.length === 0) {
        await Cart.deleteOne({ userId });
      } else {
        await cart.save();
      }
    }

    return res.status(201).json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    return res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query["userId"] = {
        $in: await User.find({
          $or: [
            { email: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
          ],
        }).distinct("_id"),
      };
    }

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user && req.user.isAdmin;

    let query = { userId };

    if (!isAdmin) {
      query.isDeleted = false;
    }

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// orderController.js (Đoạn mã đã sửa đổi)
const updateOrderStatusByAdmin = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ message: "Missing orderId or status" });
    }

    const validStatuses = ["pending", "in_progress", "done", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(403).json({
        message: "Cancelled orders cannot be updated",
      });
    }

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found after update" });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};

const cancelOrderByUser = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(403)
        .json({
          message: "Only orders in pending status can be cancelled by users",
        });
    }

    order.status = "cancelled";
    await order.save();

    return res
      .status(200)
      .json({ message: "Order successfully cancelled", order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  }
};

const addOrderFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to add feedback" });
    }

    if (order.status !== "done") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Feedback can only be added to orders with status 'done'",
        });
    }

    let feedbackText = "";
    if (typeof feedback === "string") feedbackText = feedback;
    else if (feedback && typeof feedback === "object" && feedback.feedback)
      feedbackText = feedback.feedback;

    order.feedback = feedbackText;
    await order.save();

    res.json({ success: true, message: "Feedback added successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const softDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status !== "done" && order.status !== "cancelled") {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Delete can only be applied to orders with status 'done' or 'cancelled'",
        });
    }

    if (order.isDeleted) {
      return res
        .status(400)
        .json({ success: false, message: "Order is already deleted" });
    }

    order.isDeleted = true;
    await order.save();

    res.json({ success: true, message: "Order deleted successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting order",
        error: error.message,
      });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID format" });
    }

    const order = await Order.findById(id)
      .populate("userId", "fullName email phone address")
      .populate("items.productId", "name price discountPrice images category")
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Nếu là user thường, chỉ cho xem order của chính mình
    if (req.user && !req.user.isAdmin) {
      if (order.userId._id.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, sortBy = "createdAt" } = req.query;

    // Query để lấy orders có feedback
    const query = {
      feedback: { $ne: "" }, // Chỉ lấy orders có feedback (không rỗng)
      status: "done", // Chỉ lấy orders đã hoàn thành
    };

    // Tính skip cho pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy orders có feedback
    const orders = await Order.find(query)
      .populate("userId", "fullName email phone avatar")
      .populate("items.productId", "name price discountPrice images")
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Đếm tổng số orders có feedback
    const totalFeedbacks = await Order.countDocuments(query);

    // Format response để dễ đọc
    const feedbacks = orders.map((order) => ({
      orderId: order._id,
      feedback: order.feedback,
      customer: {
        id: order.userId._id,
        fullName: order.userId.fullName,
        email: order.userId.email,
        phone: order.userId.phone,
        avatar: order.userId.avatar,
      },
      orderDetails: {
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalFeedbacks / parseInt(limit)),
        totalItems: totalFeedbacks,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Error getting feedbacks",
      error: error.message,
    });
  }
};

module.exports = {
  updateOrderStatusByAdmin,
  addOrderFeedback,
  createOrder,
  getOrdersByUser,
  getAllOrders,
  softDeleteOrder,
  cancelOrderByUser,
  getOrderById,
  getAllFeedbacks,
};
