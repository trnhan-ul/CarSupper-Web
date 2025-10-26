const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const path = require("path");
const fs = require("fs");

const getAllProducts = async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, status, name, page, limit } =
      req.query;

    let filter = {};

    if (category || gender) {
      let categoryFilter = {};

      if (category) {
        categoryFilter.name = category;
      }

      if (gender) {
        categoryFilter.gender = gender;
      }

      const matchedCategories = await Category.find(categoryFilter).select(
        "_id"
      );
      const categoryIds = matchedCategories.map((cat) => cat._id);

      if (categoryIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No products found for this category or gender.",
          pagination: { totalProducts: 0, currentPage: 1, totalPages: 1 },
        });
      }

      filter.category = { $in: categoryIds };
    }

    if (status) {
      filter.status = status;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

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
        select: "name gender status",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const totalProducts = await Product.countDocuments(filter);

    if (totalProducts === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No products found for this category or gender.",
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
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(400).json({ message: " Product not found " });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to get product", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, description, discountPrice, category, variants } =
      req.body;

    const images = req.files;
    if (!name || !price || !category || !variants) {
      return res.status(400).json({
        message: "Name, Price, Category, and Variants fields are required!",
      });
    }
    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ message: "Please upload at least one image!" });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({
        message: "Product name already exists. Please choose a different name!",
      });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      discountPrice,
      category,
      images: images.map((file) => `products/${file.filename}`),
      variants: JSON.parse(variants),
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      discountPrice,
      category,
      removeImages,
      variants,
    } = req.body;

    const productId = req.params.id;
    const images = req.files;
    if (!name || !price || !category || !variants) {
      return res.status(400).json({
        message: "Name, Price, Category, and Variants fields are required!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    if (removeImages) {
      let imagesToRemove;
      try {
        imagesToRemove = JSON.parse(removeImages);
      } catch (error) {
        return res.status(400).json({ message: "Invalid removeImages format" });
      }
      if (Array.isArray(imagesToRemove)) {
        for (const imagePath of imagesToRemove) {
          const imagePathToDelete = imagePath.split("/")[1];
          const imageToDelete = path.join(
            __dirname,
            "..",
            "uploads",
            "products",
            imagePathToDelete
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
    if (images && images.length > 0) {
      product.images = [
        ...product.images,
        ...images.map((file) => `products/${file.filename}`),
      ];
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.category = category;
    product.variants = JSON.parse(variants);
    product.discountPrice = discountPrice;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStatusProduct,
};
