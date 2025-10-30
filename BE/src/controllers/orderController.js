const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, note, shippingCost } = req.body;
    if (!userId || !items || !shippingAddress) {

      return res.status(400).json({ message: "Missing required fields" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    for (const orderItem of items) {
      const { productId, variant } = orderItem;

      const cartItem = cart.items.find(
        (item) => item.productId.toString() === productId.toString()
      );
      if (!cartItem) {
        return res.status(400).json({
          message: `Product with ID ${productId} not found in cart`,
        });
      }

      const cartVariant = cartItem.variants.find(
        (v) => v.size === variant.size && v.color === variant.color
      );
      if (!cartVariant) {
        return res.status(400).json({
          message: `Variant (size: ${variant.size}, color: ${variant.color}) for product ${productId} not found in cart`,
        });
      }

      if (cartVariant.quantity < variant.quantity) {
        return res.status(400).json({
          message: `Insufficient quantity in cart for product ${productId} (size: ${variant.size}, color: ${variant.color})`,
        });
      }
    }

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const { productId, variant } = item;

        const product = await Product.findById(productId);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        const productVariant = product.variants.find(
          (v) => v.size === variant.size && v.color === variant.color
        );
        if (!productVariant) {
          throw new Error(
            `Variant (size: ${variant.size}, color: ${variant.color}) not found in product ${productId}`
          );
        }

        const requestedQuantity = variant.quantity;
        if (productVariant.stock < requestedQuantity) {
          throw new Error(
            `Insufficient stock for product ${productId} (size: ${variant.size}, color: ${variant.color})`
          );
        }

        productVariant.stock -= requestedQuantity;
        await product.save();

        return {
          productId: productId,
          variant: [
            {
              size: variant.size,
              color: variant.color,
              quantity: requestedQuantity,
              price: product.price,
            },
          ],
        };
      })
    );

    const totalAmount =
      orderItems.reduce((sum, item) => {
        return sum + item.variant[0].price * item.variant[0].quantity;
      }, 0) + (shippingCost || 0);

    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      note,
      shippingCost: shippingCost || 0,
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    for (const orderItem of items) {
      const { productId, variant } = orderItem;

      const cartItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (cartItemIndex !== -1) {
        const cartItem = cart.items[cartItemIndex];
        const cartVariantIndex = cartItem.variants.findIndex(
          (v) => v.size === variant.size && v.color === variant.color
        );

        if (cartVariantIndex !== -1) {
          const cartVariant = cartItem.variants[cartVariantIndex];
          if (cartVariant.quantity <= variant.quantity) {
            cartItem.variants.splice(cartVariantIndex, 1);
          } else {
            cartVariant.quantity -= variant.quantity;
          }

          if (cartItem.variants.length === 0) {
            cart.items.splice(cartItemIndex, 1);
          }
        }
      }
    }

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
    } else {
      await cart.save();
    }

    return res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(403).json({
        message: "Cancelled orders cannot be updated",
      });
    }

    if (status === "cancelled") {
      for (const orderItem of order.items) {
        const { productId, variant } = orderItem;
        const requestedVariant = variant[0];

        const product = await Product.findById(productId);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        const productVariant = product.variants.find(
          (v) =>
            v.size === requestedVariant.size &&
            v.color === requestedVariant.color
        );
        if (!productVariant) {
          throw new Error(
            `Variant (size: ${requestedVariant.size}, color: ${requestedVariant.color}) not found in product ${productId}`
          );
        }

        productVariant.stock += requestedVariant.quantity;
        await product.save();
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
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
      return res.status(403).json({
        message: "Only orders in pending status can be cancelled by users",
      });
    }

    for (const orderItem of order.items) {
      const { productId, variant } = orderItem;
      const requestedVariant = variant[0];

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const productVariant = product.variants.find(
        (v) =>
          v.size === requestedVariant.size && v.color === requestedVariant.color
      );
      if (!productVariant) {
        throw new Error(
          `Variant (size: ${requestedVariant.size}, color: ${requestedVariant.color}) not found in product ${productId}`
        );
      }

      productVariant.stock += requestedVariant.quantity;
      await product.save();
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      message: "Order successfully cancelled",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error cancelling order",
      error: error.message,
    });
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
      return res.status(403).json({
        success: false,
        message: "Feedback can only be added to orders with status 'done'",
      });
    }

    // Accept either `{ feedback: "text" }` or a plain string (depending on frontend usage)
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
      return res.status(403).json({
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

    res.json({
      success: true,
      message: "Order deleted successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting order",
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
};
