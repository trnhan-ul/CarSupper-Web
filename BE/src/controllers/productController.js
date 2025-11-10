const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const path = require("path");
const fs = require("fs");
const mongoose = require('mongoose');
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, status, name, page, limit } =
      req.query;

    let filter = {};

    // Filter by category
    if (category) {
      const matchedCategories = await Category.find({ name: category }).select(
        "_id"
      );
      const categoryIds = matchedCategories.map((cat) => cat._id);

      if (categoryIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No products found for this category.",
          pagination: { totalProducts: 0, currentPage: 1, totalPages: 1 },
        });
      }

      filter.category = { $in: categoryIds };
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Filter by name (search)
    if (name) {
      filter.name = new RegExp(name, "i");
    }

    let sortOptions = { createdAt: -1 };

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNum - 1) * pageSize;

    const products = await Product.find(filter)
      .populate({
        path: "category",
        select: "name status",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const totalProducts = await Product.countDocuments(filter);

    if (totalProducts === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No products found.",
        pagination: { totalProducts: 0, currentPage: 1, totalPages: 1 },
      });
    }

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to get products list",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tăng viewCount mỗi khi xem sản phẩm
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate("category");

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to get product", error: error.message });
  }
};

const createProduct = async (req, res) => {
  // Tên hàm đã được đổi đúng
  console.log("--- DEBUG createProductController START ---");
  console.log("Raw req.body:", req.body); // <-- XEM KỸ LOG NÀY TRONG CONSOLE CỦA SERVER
  console.log("Raw req.files:", req.files);

  try {
    const { name, price, description, discountPrice, category, variants } =
      req.body;
    const images = req.files;

    // --- ÉP KIỂU VÀ KIỂM TRA DỮ LIỆU ĐẦU VÀO CẨN THẬN ---

    // 1. Name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product name is required and cannot be empty.",
      });
    }

    // 2. Price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a positive number." });
    }

    // 3. Discount Price (Optional)
    const parsedDiscountPrice = discountPrice ? parseFloat(discountPrice) : 0;
    if (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be a non-negative number.",
      });
    }
    if (parsedDiscountPrice >= parsedPrice) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than the regular price.",
      });
    }

    // 4. Category
    let categoryObjectId;
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      categoryObjectId = new mongoose.Types.ObjectId(category); // <-- Ép kiểu TƯỜNG MINH
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID provided or category is missing.",
      });
    }

    // 6. Images
    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload at least one image!" });
    }

    // Kiểm tra trùng tên sản phẩm
    const existingProduct = await Product.findOne({ name: name.trim() }); // Trim name trước khi kiểm tra
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product name already exists. Please choose a different name!",
      });
    }

    // --- TẠO SẢN PHẨM MỚI ---
    const newProduct = new Product({
      name: name.trim(), // Lưu tên đã trim
      description,
      price: parsedPrice,
      discountPrice: parsedDiscountPrice,
      category: categoryObjectId, // <-- SỬ DỤNG CATEGORY ĐÃ ĐƯỢC ÉP KIỂU ObjectId
      images: images.map((file) => `products/${file.filename}`),
    });

    console.log("Product object BEFORE save():", newProduct); // <-- XEM LOG NÀY
    await newProduct.save(); // <-- Lỗi validation xảy ra ở đây

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error); // Log lỗi chi tiết
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Product validation failed: ${messages.join(", ")}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error during product creation",
      error: error.message,
    });
  } finally {
    console.log("--- DEBUG createProductController END ---");
  }
};

const updateStatusProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Status must be either 'active' or 'inactive'.",
      });
    }

    const updateStatus = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updateStatus) {
      return res.status(400).json({
        message: "Product not found",
      });
    }
    res.status(200).json({
      status: "Successful",
      message: "Product update status successfully",
      data: updateStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update status product",
      error: error.message,
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, discountPrice, category, removeImages } =
      req.body;

    const productId = req.params.id;
    const images = req.files;

    // --- ÉP KIỂU VÀ KIỂM TRA DỮ LIỆU ĐẦU VÀO CẨN THẬN (TƯƠNG TỰ CREATE) ---
    // 1. Name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product name is required and cannot be empty.",
      });
    }

    // 2. Price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a positive number." });
    }

    // 3. Discount Price (Optional)
    const parsedDiscountPrice = discountPrice ? parseFloat(discountPrice) : 0;
    if (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be a non-negative number.",
      });
    }
    if (parsedDiscountPrice >= parsedPrice) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than the regular price.",
      });
    }

    // 4. Category
    let categoryObjectId;
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      categoryObjectId = new mongoose.Types.ObjectId(category);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID provided or category is missing.",
      });
    }

    // 5. Variants removed in car shop flow

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    // Xử lý removeImages
    if (removeImages) {
      let imagesToRemove;
      try {
        imagesToRemove = JSON.parse(removeImages);
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid removeImages format" });
      }
      if (Array.isArray(imagesToRemove)) {
        for (const imagePath of imagesToRemove) {
          const filename = imagePath.split("/").pop(); // Lấy tên file từ đường dẫn
          const imageToDelete = path.join(
            __dirname,
            "..",
            "uploads",
            "products",
            filename
          );
          if (fs.existsSync(imageToDelete)) {
            try {
              fs.unlinkSync(imageToDelete);
            } catch (err) {
              console.error(
                `Failed to delete image ${imageToDelete}: ${err.message}`
              );
            }
          }
          product.images = product.images.filter((img) => img !== imagePath);
        }
      }
    }
    // Thêm ảnh mới
    if (images && images.length > 0) {
      product.images = [
        ...product.images,
        ...images.map((file) => `products/${file.filename}`),
      ];
    }
    // Kiểm tra nếu không còn ảnh nào
    if (
      product.images.length === 0 &&
      images &&
      images.length === 0 &&
      (!removeImages ||
        JSON.parse(removeImages).length === product.images.length)
    ) {
      // Tùy chọn: Nếu product schema của bạn yêu cầu ít nhất 1 ảnh, bạn cần validate ở đây.
      // Ví dụ: return res.status(400).json({ success: false, message: "Product must have at least one image." });
    }

    product.name = name.trim();
    product.price = parsedPrice;
    product.description = description;
    product.category = categoryObjectId; // <-- SỬ DỤNG CATEGORY ĐÃ ÉP KIỂU
    product.discountPrice = parsedDiscountPrice;

    console.log("Product object BEFORE save():", product); // <-- XEM LOG NÀY
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Product validation failed: ${messages.join(", ")}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error during product update",
      error: error.message,
    });
  } finally {
    console.log("--- DEBUG updateProductController END ---");
  }
};

// Advanced Search with multiple filters and sorting
const advancedSearch = async (req, res) => {
  try {
    const {
      q, // search query
      category,
      minPrice,
      maxPrice,
      sort, // price_asc, price_desc, newest, popular, most_viewed
      status,
      page,
      limit,
    } = req.query;

    let filter = {};

    // Text search on name and description
    if (q) {
      filter.$text = { $search: q };
    }

    // Filter by category
    if (category) {
      const matchedCategories = await Category.find({
        name: { $regex: category, $options: "i" },
      }).select("_id");
      const categoryIds = matchedCategories.map((cat) => cat._id);

      if (categoryIds.length > 0) {
        filter.category = { $in: categoryIds };
      }
    }

    // Filter by status (default: active)
    filter.status = status || "active";

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Sorting logic
    let sortOptions = {};
    switch (sort) {
      case "price_asc":
        sortOptions = { price: 1 };
        break;
      case "price_desc":
        sortOptions = { price: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "popular":
        sortOptions = { soldCount: -1 };
        break;
      case "most_viewed":
        sortOptions = { viewCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Default: newest first
    }

    // If text search is used, add text score for relevance
    if (q) {
      sortOptions.score = { $meta: "textScore" };
    }

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 12;
    const skip = (pageNum - 1) * pageSize;

    const products = await Product.find(filter)
      .populate("category", "name status")
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / pageSize),
        pageSize,
      },
      filters: {
        query: q,
        category,
        minPrice,
        maxPrice,
        sort,
        status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error performing advanced search",
      error: error.message,
    });
  }
};

// Get trending products (based on viewCount and soldCount in recent time)
const getTrendingProducts = async (req, res) => {
  try {
    const { limit, days } = req.query;
    const productLimit = parseInt(limit) || 10;
    const daysAgo = parseInt(days) || 30;

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

    // Get trending products based on views and sales
    const trendingProducts = await Product.find({
      status: "active",
      createdAt: { $gte: dateThreshold },
    })
      .populate("category", "name")
      .sort({ viewCount: -1, soldCount: -1 })
      .limit(productLimit)
      .lean();

    res.status(200).json({
      success: true,
      data: trendingProducts,
      message: `Top ${productLimit} trending products in the last ${daysAgo} days`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching trending products",
      error: error.message,
    });
  }
};

// Get popular products (all time best sellers)
const getPopularProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    const productLimit = parseInt(limit) || 10;

    const popularProducts = await Product.find({ status: "active" })
      .populate("category", "name")
      .sort({ soldCount: -1, viewCount: -1 })
      .limit(productLimit)
      .lean();

    res.status(200).json({
      success: true,
      data: popularProducts,
      message: `Top ${productLimit} popular products`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching popular products",
      error: error.message,
    });
  }
};

// Get latest products
const getLatestProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    const productLimit = parseInt(limit) || 10;

    const latestProducts = await Product.find({ status: "active" })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(productLimit)
      .lean();

    res.status(200).json({
      success: true,
      data: latestProducts,
      message: `Latest ${productLimit} products`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching latest products",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStatusProduct,
  advancedSearch,
  getTrendingProducts,
  getPopularProducts,
  getLatestProducts,
};