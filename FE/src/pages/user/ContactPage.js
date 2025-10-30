import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Toast } from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const Contact = () => {
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("⚠️ Please fill in all fields before submitting!");
      return;
    }
    setShowToast(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">📩 Contact Us</h2>
      <p className="text-center">
        Have a question about our products, orders, or services? Fill out the
        form below, and we’ll get back to you as soon as possible. Please
        provide as much detail as possible to help us assist you better.
      </p>

      <Row className="shadow-sm p-4 bg-light rounded">
        <Col md={6}>
          <h4>Get in Touch</h4>
          <p>Fill in your details and let us know how we can help.</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicName" className="mb-3">
              <Form.Label>Your Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formBasicEmail" className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formBasicMessage" className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Tell us what you need help with..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
              <small className="text-muted">
                Please provide details like order number (if applicable) or
                specific product inquiries.
              </small>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Send Message
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          <p>
            <FaMapMarkerAlt className="me-2 text-danger" />
            <strong> Address:</strong> Group 4 SDN302
          </p>
          <p>
            <FaPhone className="me-2 text-success" />
            <strong> Phone:</strong> 0396686970
          </p>
          <p>
            <FaEnvelope className="me-2 text-primary" />
            <strong> Email:</strong> group4sdn302@carsuper.com
          </p>

          <h5>Follow Us</h5>
          <p>
            <a
              className="text-decoration-none text-primary me-3"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook size={20} /> Facebook
            </a>
            <a
              className="text-decoration-none text-danger"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram size={20} /> Instagram
            </a>
          </p>
        </Col>
      </Row>

      {/* Success Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "rgba(0, 255, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <Toast.Body>
          ✅ Message sent successfully! We'll get back to you soon.
        </Toast.Body>
      </Toast>
    </Container>
  );
};

export default Contact;
