const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    const category = new Category({
      name,
    });
    await category.save();
    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const { status } = req.query;

    let matchFilter = {};

    if (status === "active") {
      matchFilter.status = "active";
    } else if (status === "inactive") {
      matchFilter.status = "inactive";
    }

    // Use aggregation to get product count for each category
    const categories = await Category.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0, // Remove products array from response
        },
      },
      { $sort: { status: -1, createdAt: -1 } },
    ]);

    res.json({
      success: true,
      data: categories,
      message: "Get categories successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
      message: "Get category successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
      }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const updateCategoryStatus = async (req, res) => {
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

    const category = await Category.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({
      success: true,
      message: `Category status updated to '${status}' successfully`,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} product${
          productCount > 1 ? "s are" : " is"
        } using this category.`,
        productCount,
      });
    }

    // Delete category if no products are using it
    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  updateCategory,
  updateCategoryStatus,
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
};
