const express = require("express");
const router = express.Router();
const {
  register,
  verifyOTPRegister,
  login,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-otp-register", verifyOTPRegister);
router.post("/login", login);

module.exports = router;
