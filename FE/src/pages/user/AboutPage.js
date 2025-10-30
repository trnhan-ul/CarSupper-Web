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
              <h2 className="text-center mb-4">About UniStyle Clothing</h2>
              <p>
                Welcome to UniStyle Clothing – where fashion meets comfort. Our
                mission is to bring you high-quality, stylish, and affordable
                clothing that makes you feel confident every day.
              </p>
              <p>
                We believe in sustainability and ethical production. Every piece
                of our collection is crafted with care, ensuring a perfect blend
                of modern trends and timeless designs.
              </p>
              <p>
                UniStyle Clothing is dedicated to innovation in fashion. We
                incorporate the latest materials and designs to create apparel
                that fits perfectly into the dynamic lifestyle of modern
                individuals. Whether you are looking for casual wear,
                streetwear, or sophisticated fashion, we have something for
                everyone.
              </p>
              <p>
                Our collections are designed for versatility, allowing you to
                express yourself confidently in any setting. We aim to empower
                people through fashion by making high-quality, fashionable
                clothing accessible to all.
              </p>
              <p>
                Thank you for choosing UniStyle Clothing. Join us on our journey
                to redefine fashion, one outfit at a time.
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
