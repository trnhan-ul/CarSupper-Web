import React from "react";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import { FaCar, FaHandshake, FaShieldAlt, FaAward } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const AboutPage = () => {
  const features = [
    {
      icon: <FaCar size={40} color="#475569" />,
      title: "Wide Selection",
      description: "Browse thousands of quality vehicles from trusted sellers nationwide."
    },
    {
      icon: <FaHandshake size={40} color="#475569" />,
      title: "Trusted Partners",
      description: "We work only with verified dealers and certified car sellers."
    },
    {
      icon: <FaShieldAlt size={40} color="#475569" />,
      title: "Safe Transactions",
      description: "Every purchase is protected with secure payment and warranty options."
    },
    {
      icon: <FaAward size={40} color="#475569" />,
      title: "Expert Support",
      description: "Our team provides guidance throughout your car buying journey."
    }
  ];

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "40px", paddingBottom: "60px" }}>
      <Container>
        {/* Hero Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <div className="text-center">
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                marginBottom: "15px",
                color: "#1e293b"
              }}>
                About CarSupper
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#64748b" }}>
                Your trusted destination for finding the perfect vehicle
              </p>
            </div>
          </Col>
        </Row>

        {/* Main Content */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="p-4 shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <Card.Body>
                <h3 className="mb-4" style={{ color: "#1e293b", fontWeight: "600" }}>
                  Welcome to CarSupper
                </h3>
                <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#475569" }}>
                  At <strong>CarSupper</strong>, we're revolutionizing the way you buy and sell cars.
                  Founded with a passion for automotive excellence and customer satisfaction, we've built a platform
                  that connects car buyers with quality vehicles from trusted sellers across the country.
                </p>
                <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#475569" }}>
                  Whether you're looking for a reliable sedan for your daily commute, a spacious SUV for family adventures,
                  a powerful sports car for weekend thrills, or an eco-friendly electric vehicle for sustainable driving,
                  CarSupper has something for everyone.
                </p>
                <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#475569" }}>
                  We believe that buying a car should be exciting, transparent, and stress-free. That's why we've created
                  a user-friendly platform with detailed vehicle listings, comprehensive photos, verified seller information,
                  and competitive pricing to help you make informed decisions.
                </p>
                <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#475569" }}>
                  Our mission is simple: to connect people with their dream cars while ensuring safety, transparency,
                  and satisfaction at every step. With CarSupper, you're not just buying a car — you're investing in
                  quality, reliability, and peace of mind.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="mb-5">
          <Col xs={12} className="text-center mb-4">
            <h2 style={{ fontWeight: "600", color: "#1e293b" }}>Why Choose CarSupper?</h2>
            <p style={{ color: "#64748b", fontSize: "1rem" }}>
              We offer more than just a marketplace — we offer a complete car buying experience
            </p>
          </Col>
          {features.map((feature, index) => (
            <Col lg={3} md={6} className="mb-4" key={index}>
              <Card
                className="h-100 text-center p-4"
                style={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div className="mb-3">{feature.icon}</div>
                <h5 style={{ fontWeight: "600", color: "#1e293b" }}>{feature.title}</h5>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{feature.description}</p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Image Gallery */}
        <Row className="mb-4">
          <Col xs={12} className="text-center mb-4">
            <h2 style={{ fontWeight: "600", color: "#1e293b" }}>Our Showcase</h2>
            <p style={{ color: "#64748b", fontSize: "1rem" }}>
              Discover the perfect vehicle for your lifestyle
            </p>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="h-100" style={{ borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <Image
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"
                alt="Luxury Sedan"
                className="w-100"
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Body className="text-center">
                <h5 style={{ fontWeight: "600", color: "#1e293b" }}>Premium Sedans</h5>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Experience luxury and comfort with our collection of premium sedans,
                  perfect for business professionals and city driving.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100" style={{ borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <Image
                src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80"
                alt="Family SUV"
                className="w-100"
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Body className="text-center">
                <h5 style={{ fontWeight: "600", color: "#1e293b" }}>Family SUVs</h5>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Spacious and versatile SUVs designed for family adventures,
                  combining safety, comfort, and modern technology.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100" style={{ borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <Image
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"
                alt="Sports Car"
                className="w-100"
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Body className="text-center">
                <h5 style={{ fontWeight: "600", color: "#1e293b" }}>Sports Cars</h5>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Feel the thrill of performance with our selection of sports cars,
                  engineered for speed, style, and unforgettable driving experiences.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={6}>
            <Card className="h-100" style={{ borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <Image
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80"
                alt="Electric Vehicles"
                className="w-100"
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Body className="text-center">
                <h5 style={{ fontWeight: "600", color: "#1e293b" }}>Electric Vehicles</h5>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Join the future of sustainable transportation with our eco-friendly
                  electric vehicles, offering zero emissions and cutting-edge technology.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100" style={{ borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <Image
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"
                alt="Pickup Trucks"
                className="w-100"
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Body className="text-center">
                <h5 style={{ fontWeight: "600", color: "#1e293b" }}>Pickup Trucks</h5>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Powerful and durable pickup trucks built for work and adventure,
                  offering exceptional towing capacity and off-road capabilities.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>        {/* Call to Action */}
        <Row className="mt-5">
          <Col xs={12}>
            <Card
              className="p-4 text-center"
              style={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc"
              }}
            >
              <h3 style={{ fontWeight: "600", marginBottom: "15px", color: "#1e293b" }}>Ready to Find Your Perfect Car?</h3>
              <p style={{ fontSize: "1rem", marginBottom: "10px", color: "#64748b" }}>
                Join thousands of satisfied customers who found their dream vehicles on CarSupper
              </p>
              <p style={{ fontSize: "1rem", fontWeight: "500", color: "#475569", marginBottom: "0" }}>
                Let's drive the future together — one journey at a time.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutPage;
