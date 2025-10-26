const express = require("express");
const router = express.Router();
const {
  register,
  verifyOTPRegister,
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyOTPForgotPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-otp-register", verifyOTPRegister);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp-reset", verifyOTPForgotPassword);

module.exports = router;
