const User = require("../models/userModel");
const Product = require("../models/productModel");

// Thêm sản phẩm vào wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        // Kiểm tra product có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Kiểm tra product có active không
        if (product.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Cannot add inactive product to wishlist",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Kiểm tra đã có trong wishlist chưa
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist",
            });
        }

        // Thêm vào wishlist
        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist successfully",
            data: {
                wishlist: user.wishlist,
            },
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding to wishlist",
            error: error.message,
        });
    }
};

// Lấy wishlist của user
const getMyWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: "wishlist",
            match: { status: "active" }, // Chỉ lấy products active
            select: "name description price discountPrice images category variants status",
            populate: {
                path: "category",
                select: "name vehicleType",
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                wishlist: user.wishlist,
                total: user.wishlist.length,
            },
        });
    } catch (error) {
        console.error("Error getting wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting wishlist",
            error: error.message,
        });
    }
};

// Xóa sản phẩm khỏi wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Kiểm tra product có trong wishlist không
        if (!user.wishlist.includes(productId)) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist",
            });
        }

        // Xóa khỏi wishlist
        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId.toString()
        );
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully",
            data: {
                wishlist: user.wishlist,
            },
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Error removing from wishlist",
            error: error.message,
        });
    }
};

// Xóa toàn bộ wishlist
const clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.wishlist = [];
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Wishlist cleared successfully",
            data: {
                wishlist: [],
            },
        });
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Error clearing wishlist",
            error: error.message,
        });
    }
};

// Kiểm tra product có trong wishlist không
const checkInWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const inWishlist = user.wishlist.includes(productId);

        return res.status(200).json({
            success: true,
            data: {
                inWishlist,
            },
        });
    } catch (error) {
        console.error("Error checking wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Error checking wishlist",
            error: error.message,
        });
    }
};

module.exports = {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist,
    clearWishlist,
    checkInWishlist,
};
