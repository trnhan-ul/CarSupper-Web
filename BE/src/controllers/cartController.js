const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// New simple controllers for car shop flow
const getMyCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    return res.json({ success: true, data: cart || { userId, items: [], totalAmount: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCartSimple = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const exists = cart.items.find(
      (i) => i.productId.toString() === productId.toString()
    );

    if (!exists) {
      // quantity cố định = 1
      cart.items.push({ productId, quantity: 1 });
      await cart.save();
    }

    const populated = await Cart.findById(cart._id).populate("items.productId");
    return res.json({ success: true, data: populated, message: "Item added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeCartItemSimple = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ success: true, data: { items: [] } });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId.toString()
    );
    await cart.save();

    const populated = await Cart.findById(cart._id).populate("items.productId");
    return res.json({ success: true, data: populated, message: "Removed item from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearMyCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ success: true, data: { items: [] } });
    cart.items = [];
    await cart.save();
    return res.json({ success: true, data: cart, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Legacy controllers (kept for reference)
const getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      cart = {
        userId,
        items: [],
        totalAmount: 0,
      };
    } else {
      let totalAmount = 0;
      for (let item of cart.items) {
        const product = item.productId;
        const currentPrice =
          product.discountPrice !== 0 ? product.discountPrice : product.price;

        for (let variant of item.variants) {
          totalAmount += currentPrice * variant.quantity;
        }
      }
      cart.totalAmount = totalAmount;
      await cart.save();
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, variants } = req.body.items;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const variantInStock = product.variants.find(
      (v) => v.size === variants.size && v.color === variants.color
    );

    if (!variantInStock) {
      return res.status(400).json({
        success: false,
        message: "This variant (size/color) is not available",
      });
    }

    if (variants.quantity > variantInStock.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${variantInStock.stock} units available in stock`,
      });
    }

    const existingItem = cart.items.find((cartItem) => {
      return cartItem.productId.toString() === productId.toString();
    });

    if (existingItem) {
      const existingVariant = existingItem.variants.find(
        (variant) =>
          variant.size === variants.size && variant.color === variants.color
      );

      if (existingVariant) {
        const newQuantity = existingVariant.quantity + variants.quantity;
        if (newQuantity > variantInStock.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${variantInStock.stock} units available in stock`,
          });
        }
        existingVariant.quantity = newQuantity;
      } else {
        existingItem.variants.push({
          size: variants.size,
          color: variants.color,
          quantity: variants.quantity,
        });
      }
    } else {
      cart.items.push({
        productId,
        variants: [
          {
            size: variants.size,
            color: variants.color,
            quantity: variants.quantity,
          },
        ],
      });
    }

    await cart.save();
    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, variantId, quantity } = req.body;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.productId._id.toString() === productId.toString()
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    const itemVariant = item.variants.find((v) => {
      const isMatch = v._id.toString() === variantId.toString();
      return isMatch;
    });
    if (!itemVariant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found in item" });
    }

    const product = item.productId;

    const variantInStock = product.variants.find(
      (v) => v.size === itemVariant.size && v.color === itemVariant.color
    );

    if (!variantInStock) {
      return res.status(400).json({
        success: false,
        message: "Variant (size/color) not available",
      });
    }

    if (quantity > variantInStock.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${variantInStock.stock} units available in stock`,
      });
    }

    itemVariant.quantity = quantity;

    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: "Cart updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, variantId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => {
      return (
        item.productId.toString() === productId.toString() &&
        item.variants.some((v) => v._id.toString() === variantId.toString())
      );
    });

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item or variant not found in cart" });
    }

    const item = cart.items[itemIndex];
    const variantIndex = item.variants.findIndex(
      (v) => v._id.toString() === variantId.toString()
    );

    if (variantIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found in item" });
    }

    item.variants.splice(variantIndex, 1);

    if (item.variants.length === 0) {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();

    res.json({ success: true, message: "Removed item from cart successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = [];

    await cart.save();
    res.json({ success: true, data: cart, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // new
  getMyCart,
  addToCartSimple,
  removeCartItemSimple,
  clearMyCart,
  // legacy (not used by new routes)
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
