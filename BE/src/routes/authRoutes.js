const express = require("express");
const router = express.Router();
const {
  register,
  verifyOTPRegister,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-otp-register", verifyOTPRegister);

module.exports = router;
