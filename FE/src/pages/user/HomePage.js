import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaTag } from "react-icons/fa";
import CarouselShare from "../../components/CarouselShare";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../api/productApi";
import { URL_IMG } from "../../utils/constant";

const HomePage = () => {
  const [newestProducts, setNewestProducts] = useState([]);

  useEffect(() => {
    const loadNewestProducts = async () => {
      const products = await fetchProducts({
        limit: 8,
        status: "active",
      });
      setNewestProducts(products.products);
    };

    loadNewestProducts();
  }, []);
  const carousels = [
    {
      id: 1,
      url: "https://i.ytimg.com/vi/i1DfGzvka7M/maxresdefault.jpg",
    },
    {
      id: 2,
      url: "https://blenderartists.org/uploads/default/original/4X/b/f/2/bf2f036d4f597186fe9bc73cceba4ac59943c141.jpeg",
    },
    {
      id: 3,
      url: "https://images6.alphacoders.com/970/thumb-1920-970345.jpg",
    },
  ];

  return (
    <Container>
      <CarouselShare carousels={carousels} />
      <Container className="py-4">
        <h1 className="text-center mb-4">NEW ARRIVALS</h1>
        <Row>
          {newestProducts?.length > 0 ? (
            newestProducts?.map((product) => {
              const productImage =
                product?.images?.length > 0
                  ? `${URL_IMG}${product?.images[0]}`
                  : "/products/error.jpg";

              const finalPrice =
                product?.discountPrice !== 0
                  ? product?.discountPrice
                  : product?.price;

              const isDiscounted =
                product?.discountPrice !== 0 &&
                product?.discountPrice > 0 &&
                product?.discountPrice < product?.price;

              return (
                <Col sm={6} md={3} className="mb-4" key={product?._id}>
                  <Link
                    to={`/product-detail/${product?._id}`}
                    className="nav-link"
                  >
                    <Card className="product-card shadow-sm border-0">
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={productImage}
                          alt={product?.name}
                          style={{
                            height: 300,
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                        {isDiscounted && (
                          <span
                            className="badge bg-danger position-absolute"
                            style={{ top: 10, left: 10, fontSize: "12px" }}
                          >
                            <FaTag /> Sale
                          </span>
                        )}
                      </div>

                      <Card.Body className="text-center">
                        <Card.Title className="fw-bold">
                          {product.name}
                        </Card.Title>
                        <p className="text-muted small">
                          {product.category?.name || "Category"}
                        </p>

                        <div className="d-flex justify-content-center align-items-center">
                          <span className="fw-bold text-danger fs-5 me-2">
                            ${finalPrice.toLocaleString()}
                          </span>
                          {isDiscounted && (
                            <s
                              className="text-muted"
                              style={{ fontSize: "14px" }}
                            >
                              ${product.price.toLocaleString()}
                            </s>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              );
            })
          ) : (
            <p className="text-center">No new products available.</p>
          )}
        </Row>

        <div className="d-flex justify-content-center align-items-center">
          <Link to="/our-store" className="nav-link">
            <Button className="custom-button">View All</Button>
          </Link>
        </div>
      </Container>
    </Container>
  );
};

export default HomePage;
