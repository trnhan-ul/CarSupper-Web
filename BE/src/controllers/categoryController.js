const Category = require("../models/categoryModel");

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

    let query = {};

    if (status === "active") {
      query.status = "active";
    } else if (status === "inactive") {
      query.status = "inactive";
    }

    const categories = await Category.find(query).sort({ status: -1 });

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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

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
