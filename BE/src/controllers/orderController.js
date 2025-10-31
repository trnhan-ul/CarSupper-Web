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

    let order = await Order.findById(orderId); // Dùng `let` để có thể gán lại

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(403).json({
        message: "Cancelled orders cannot be updated",
      });
    }

    let updatedOrder; // Biến để lưu trữ kết quả cập nhật

    if (status === "cancelled") {
      // Khi hủy đơn hàng, cần thực hiện logic trả lại stock
      // Logic này yêu cầu truy cập order.items, vì vậy không thể dùng findByIdAndUpdate trực tiếp ngay lúc này
      // Sau khi xử lý stock, bạn cần cập nhật và lưu lại đối tượng order.
      // Tuy nhiên, lỗi validation xuất phát từ `order.save()`.
      // Để giải quyết, chúng ta sẽ cố gắng chỉnh sửa order.items nếu nó thiếu trường size
      // Hoặc cách đơn giản nhất là cập nhật status sau khi xử lý stock,
      // và sau đó có thể chỉ dùng updateById để thay đổi trạng thái nếu không muốn validation đầy đủ.

      for (const orderItem of order.items) {
        // Kiểm tra an toàn trước khi truy cập
        const requestedVariant = orderItem.variant && orderItem.variant.length > 0 ? orderItem.variant[0] : null;

        if (!requestedVariant || !requestedVariant.size || !requestedVariant.color || !requestedVariant.quantity) {
          // Đây là lúc bạn phát hiện dữ liệu đơn hàng cũ bị lỗi.
          // Bạn có thể chọn:
          // 1. Ném lỗi rõ ràng để sửa đơn hàng cũ.
          // 2. Cung cấp một giá trị mặc định nếu trường đó thiếu (nếu logic cho phép).
          // 3. Hoặc bỏ qua logic hoàn trả stock nếu item bị lỗi.

          // Đối với mục đích này, chúng ta sẽ ném lỗi để người dùng biết có đơn hàng lỗi.
          console.error(`Validation Error: Order ${orderId} has an item missing required variant fields: ${JSON.stringify(orderItem)}`);
          return res.status(400).json({ message: `Order validation failed for item variant: size/color/quantity is required. Please check order ${orderId} data.`, error: `Missing variant fields in order item for product ${orderItem.productId}` });
          // Nếu bạn KHÔNG muốn ném lỗi mà muốn cố gắng tiếp tục, bạn phải bỏ qua item này hoặc gán giá trị mặc định.
        }

        const product = await Product.findById(orderItem.productId); // Dùng orderItem.productId, không phải productId biến mới
        if (!product) {
          throw new Error(`Product with ID ${orderItem.productId} not found`);
        }

        const productVariant = product.variants.find(
          (v) =>
            v.size === requestedVariant.size &&
            v.color === requestedVariant.color
        );
        if (!productVariant) {
          throw new Error(
            `Variant (size: ${requestedVariant.size}, color: ${requestedVariant.color}) not found in product ${orderItem.productId}`
          );
        }

        productVariant.stock += requestedVariant.quantity;
        await product.save(); // Lưu product đã cập nhật stock
      }

      // Sau khi xử lý hoàn trả stock, cập nhật trạng thái đơn hàng
      // Dùng findByIdAndUpdate cho chính xác hơn và có thể bỏ qua validation của các trường khác
      updatedOrder = await Order.findByIdAndUpdate(
        orderId, // ID của đơn hàng
        { status: status }, // Chỉ cập nhật trường status
        { new: true, runValidators: true } // `new: true` để trả về document đã cập nhật, `runValidators: true` để chạy validation trên trường `status`
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found after update" });
      }

    } else {
      // Đối với các trạng thái khác, chỉ cần cập nhật trạng thái trực tiếp
      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: status },
        { new: true, runValidators: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found after update" });
      }
    }

    return res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error); // Log lỗi chi tiết ở backend
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
      return res.status(403).json({ message: "Only orders in pending status can be cancelled by users" });
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({ message: "Order successfully cancelled", order });
  } catch (error) {
    return res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};

const addOrderFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to add feedback" });
    }

    if (order.status !== "done") {
      return res.status(403).json({ success: false, message: "Feedback can only be added to orders with status 'done'" });
    }

    let feedbackText = "";
    if (typeof feedback === "string") feedbackText = feedback;
    else if (feedback && typeof feedback === "object" && feedback.feedback) feedbackText = feedback.feedback;

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
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "done" && order.status !== "cancelled") {
      return res.status(403).json({ success: false, message: "Delete can only be applied to orders with status 'done' or 'cancelled'" });
    }

    if (order.isDeleted) {
      return res.status(400).json({ success: false, message: "Order is already deleted" });
    }

    order.isDeleted = true;
    await order.save();

    res.json({ success: true, message: "Order deleted successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting order", error: error.message });
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
