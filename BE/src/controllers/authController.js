const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const OTP = require("../models/otpModel");
const { validateEmail } = require("../utils/validation");

const generateAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id, isAdmin: user.isAdmin, status: user.status },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { _id: user._id, isAdmin: user.isAdmin, status: user.status },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

const register = async (req, res) => {
    try {
        const { fullName, email, password, address, phone, avatar, gender } =
            req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and password are required",
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: "Email already registered" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 30 * 60 * 1000;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingOTP = await OTP.findOne({ email });

        if (existingOTP) {
            await OTP.findOneAndUpdate(
                { email },
                {
                    otp: otpCode,
                    expiresAt: otpExpires,
                    tempUserData: {
                        fullName,
                        password: hashedPassword,
                        address,
                        phone,
                        avatar,
                        gender,
                    },
                },
                { new: true }
            );
        } else {
            await OTP.create({
                email,
                otp: otpCode,
                expiresAt: otpExpires,
                tempUserData: {
                    fullName,
                    password: hashedPassword,
                    address,
                    phone,
                    avatar,
                    gender,
                },
            });
        }

        await sendOTP(email, otpCode, "register");

        res.status(200).json({
            success: true,
            message:
                "An OTP has been sent to your email. Please verify to complete registration.",
            data: { email },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const verifyOTPRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const storedOTP = await OTP.findOne({ email, otp });
        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (storedOTP.expiresAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
            });
        }

        const { fullName, password, address, phone, avatar, gender } =
            storedOTP.tempUserData;

        const newUser = new User({
            fullName,
            email,
            password,
            address,
            phone,
            avatar,
            gender,
        });

        await newUser.save();
        await OTP.deleteOne({ email, otp });

        res.status(201).json({
            success: true,
            message: "Registration successful! Please log in to continue.",
            data: { email },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};








const sendOTP = async (email, otp, type = "register") => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        let subject, htmlContent;

        // Màu sắc chủ đạo cho CarSupper
        const primaryColor = "#2D72D1"; // Một màu xanh dương hiện đại
        const lightBgColor = "#e0f2f7"; // Nền nhạt cho khu vực OTP

        if (type === "register") {
            subject = "🔐 Mã OTP của bạn để hoàn tất đăng ký CarSupper";
            htmlContent = `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          <h1 style="color: ${primaryColor}; text-align: center; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
            CarSupper <span style="font-size: 0.8em; vertical-align: middle;">🚗</span>
          </h1>
          <h2 style="color: #333; text-align: center; margin-top: 0; font-size: 24px;">🔐 Hoàn tất Đăng ký của bạn</h2>
          <p style="font-size: 16px; color: #333;">Xin chào,</p>
          <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã đăng ký tài khoản tại CarSupper! Để hoàn tất việc đăng ký, vui lòng sử dụng mã OTP dưới đây:</p>
          <div style="background-color: ${lightBgColor}; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0; font-size: 36px; color: ${primaryColor}; letter-spacing: 3px; font-weight: bold;">${otp}</h3>
          </div>
          <p style="font-size: 14px; color: #666;">Mã này có hiệu lực trong vòng <strong>30 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p style="font-size: 16px; color: #333;">Vui lòng nhập mã này vào trang web để kích hoạt tài khoản của bạn.</p>
          
          

          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">Nếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email này hoặc liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2025 CarSupper. Tất cả quyền được bảo lưu.</p>
        </div>
      `;
        } else if (type === "reset") {
            subject = "🔐 Mã OTP của bạn để đặt lại mật khẩu CarSupper";
            htmlContent = `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          <h1 style="color: ${primaryColor}; text-align: center; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
            CarSupper <span style="font-size: 0.8em; vertical-align: middle;">🚗</span>
          </h1>
          <h2 style="color: #333; text-align: center; margin-top: 0; font-size: 24px;">🔐 Đặt lại Mật khẩu của bạn</h2>
          <p style="font-size: 16px; color: #333;">Xin chào,</p>
          <p style="font-size: 16px; color: #333;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản CarSupper của mình. Vui lòng sử dụng mã OTP dưới đây:</p>
          <div style="background-color: ${lightBgColor}; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0; font-size: 36px; color: ${primaryColor}; letter-spacing: 3px; font-weight: bold;">${otp}</h3>
          </div>
          <p style="font-size: 14px; color: #666;">Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p style="font-size: 16px; color: #333;">Vui lòng nhập mã này vào trang web để đặt lại mật khẩu mới.</p>

          <!-- Nút đặt lại mật khẩu - bạn có thể thay đổi liên kết href khi triển khai thực tế -->
          <div style="text-align: center; margin-top: 30px;">
              <a href="#" style="background-color: ${primaryColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Đặt lại Mật khẩu</a>
          </div>

          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2025 CarSupper. Tất cả quyền được bảo lưu.</p>
        </div>
      `;
        }

        const mailOptions = {
            from: `"CarSupper" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Lỗi khi gửi email OTP:", error); // Log lỗi chi tiết hơn
        throw new Error("Không thể gửi email OTP. Vui lòng thử lại sau.");
    }
};
module.exports = {
    register,
    verifyOTPRegister,
};