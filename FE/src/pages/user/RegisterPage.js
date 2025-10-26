import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { registerUser, verifyOTPRegister } from "../../api/authApi";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phone: "",
    address: "",
    avatar: "avatars/tempImages.jpg",
  });

  const [loading, setLoading] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false); 
  const [otp, setOtp] = useState(""); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      toast.error("Phone number must be 10-11 digits.");
      setLoading(false);
      return;
    }

    const newUser = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      isAdmin: false,
      avatar: formData.avatar,
      gender: formData.gender,
      phone: formData.phone,
      address: formData.address,
    };

    try {
      const response = await registerUser(newUser);
      if (response.success) {
        toast.success(response.message);
        setShowOTPForm(true);
      }
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await verifyOTPRegister(formData.email, otp);
      if (response.success) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const newUser = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        isAdmin: false,
        avatar: formData.avatar,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
      };
      const response = await registerUser(newUser);
      if (response.success) {
        toast.success("A new OTP has been sent to your email.");
        setOtp(""); 
      }
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center">Register</h2>

          {!showOTPForm ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10,11}"
                  placeholder="Enter 10-11 digit phone number"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Register"
                )}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleVerifyOTP}>
              <Form.Group className="mb-3">
                <Form.Label>Enter OTP</Form.Label>
                <Form.Control
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the OTP sent to your email"
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 mb-2"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Verify OTP"
                )}
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
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;