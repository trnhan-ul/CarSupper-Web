import React from "react";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const AboutPage = () => {
  return (
    <Container className="mt-5 mb-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow">
            <Card.Body>
              <h2 className="text-center mb-4">About CarSupper</h2>
              <p>
                Welcome to <strong>CarSupper</strong> - where passion meets performance.
                We are dedicated to bringing you the best cars, from elegant city rides
                to powerful SUVs, all designed to elevate your driving experience.
              </p>
              <p>
                At CarSupper, we believe buying a car should be exciting and effortless.
                Our platform connects you with a wide range of trusted dealers and
                high-quality vehicles, ensuring transparency, safety, and satisfaction
                in every transaction.
              </p>
              <p>
                We are committed to innovation and reliability. Whether you are
                searching for a new car, a pre-owned vehicle, or simply exploring
                the latest automotive trends, CarSupper is here to guide you
                every step of the way.
              </p>
              <p>
                Our mission is simple: to help you find the car that fits your
                lifestyle, budget, and dreams. With detailed listings, expert
                insights, and personalized support, we make car shopping smarter
                and more enjoyable.
              </p>
              <p>
                Thank you for choosing <strong>CarSupper</strong>.
                Let's drive the future together — one journey at a time.
              </p>
            </Card.Body>

          </Card>
        </Col>
      </Row>
      {/* Image Gallery */}
      <Row className="mt-5 d-flex align-items-center">
        <Col md={4} className="text-center">
          <Image
            src="https://www.visioncitypng.com/wp-content/uploads/2024/04/IMG_20210505_132231-860x480-1.jpg"
            alt="Premium hoodie design"
            className="img-fluid rounded"
          />
        </Col>
        <Col md={4} className="text-center">
          <div>
            <p>
              Experience premium comfort with our high-quality hoodies, crafted
              for a sleek and modern look.
            </p>
          </div>
        </Col>
        <Col md={4} className="text-center">
          <Image
            src="https://www.visioncitypng.com/wp-content/uploads/2024/04/IMG_20210505_132324-860x480-1.jpg"
            alt="Streetwear Collection"
            className="img-fluid rounded"
          />
        </Col>
      </Row>
      <Row className="mt-5 d-flex align-items-center">
        <Col md={4} className="text-center">
          <p>
            Designed for everyday wear, offering both style and functionality
            for the modern wardrobe.
          </p>
        </Col>
        <Col md={4} className="text-center">
          <Image
            src="https://cdn.shopify.com/s/files/1/0785/8982/1248/files/AJ0062_1.jpg?v=1719044807&width=3840"
            alt="Minimalist jacket"
            className="img-fluid rounded"
          />
        </Col>
        <Col md={4} className="text-center">
          <p>
            Embrace timeless elegance with our minimalist yet fashionable
            outerwear collection.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
