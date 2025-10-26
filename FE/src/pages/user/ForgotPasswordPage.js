import React, { useState } from "react";
import { toast } from "react-toastify";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constant";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setStep(3);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/verify-otp-reset`, {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successful! You can now login.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      toast.success("A new OTP has been sent to your email.");
      setOtp(""); // Đặt lại OTP để người dùng nhập mã mới
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: "500px", marginTop: "50px", minHeight: 356 }}>
      <h2 className="text-center mb-4">Forgot Password</h2>

      {step === 1 && (
        <Form>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Button
            onClick={handleSendOTP}
            disabled={loading}
            className="mt-3 w-100"
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Send OTP"}
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form>
          <Form.Group>
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </Form.Group>
          <Button
            onClick={handleVerifyOTP}
            disabled={loading}
            className="mt-3 w-100 mb-2"
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Verify OTP"}
          </Button>
          <Button
            variant="link"
            onClick={handleResendOTP}
            disabled={loading}
            className="p-0"
          >
            Resend OTP
          </Button>
        </Form>
      )}

      {step === 3 && (
        <Form>
          <Form.Group>
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button
            onClick={handleResetPassword}
            disabled={loading}
            className="mt-3 w-100"
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Reset Password"}
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default ForgotPasswordPage;