const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password");
    res.status(200).json({
      success: true,
      message: "User list retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, phone, gender, address } = req.body;

  try {
    // Validate fullName
    if (!fullName || fullName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Full name cannot be empty",
      });
    }

    // Validate phone format (10-11 digits)
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10-11 digits",
      });
    }

    // Validate gender enum
    if (gender && !["male", "female", "other"].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Gender must be 'male', 'female', or 'other'",
      });
    }

    // Prepare update data - chỉ cho phép update các fields được phép
    const updateData = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender.toLowerCase();
    if (address !== undefined) updateData.address = address.trim();

    // Handle avatar upload
    if (req.file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Only .jpeg, .jpg, .png files are allowed",
        });
      }

      // Delete old avatar if exists
      const user = await User.findById(userId);
      if (user && user.avatar) {
        const oldAvatarFilename = user.avatar.split("/")[1];
        const oldAvatarPath = path.join(
          __dirname,
          "..",
          "uploads",
          "avatars",
          oldAvatarFilename
        );

        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      updateData.avatar = `avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

const updateStatusUser = async (req, res) => {
  const { userId } = req.params;
  const { status, password } = req.body;

  try {
    if (!status || !["active", "inactive"].includes(status)) {
      console.log(" new status", status);
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'inactive'",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser.isAdmin) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required to update status",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password",
        });
      }
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to '${status}' successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { userId } = req.params;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // Validate confirm password if provided
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Check if new password is same as old password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateStatusUser,
  changePassword,
};
