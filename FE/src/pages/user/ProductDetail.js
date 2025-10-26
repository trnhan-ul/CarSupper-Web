import React, { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { addToCart } from "../../api/cartApi";
import axios from "axios"; 
import { API_BASE_URL, URL_IMG } from "../../utils/constant";
import { toast } from "react-toastify";

const colorMap = {
  Black: "#000000",
  White: "#FFFFFF",
  Gray: "#808080",
  Navy: "#000080",
  Red: "#FF0000",
  Blue: "#0000FF",
  Yellow: "#FFD700",
  Green: "#008000",
  Pink: "#FFC0CB",
};

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");


  const fetchProductById = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/${productId}`);
      setProduct(res.data.data);
    } catch (error) {
      toast.error("Failed to load product");
    }
  };

  useEffect(() => {
    fetchProductById();
  }, [productId]);

  useEffect(() => {
    if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product?.variants?.length) {
      const availableColors = [
        ...new Set(
          product.variants.filter((v) => v.stock > 0).map((v) => v.color)
        ),
      ];
      if (availableColors.length) {
        setSelectedColor(availableColors[0]);
      }
    }
  }, [product]);

  const availableSizes = product?.variants
    ?.filter((v) => v.color === selectedColor && v.stock > 0)
    .map((v) => v.size);

  useEffect(() => {
    if (availableSizes?.length) {
      setSelectedSize(availableSizes[0]);
    }
  }, [selectedColor]);

  const handleAddToCart = async () => {
    if (!user?._id) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color.");
      return;
    }

    const cartItem = {
      productId: product._id,
      variants: {
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      },
    };

    try {
      await addToCart(cartItem, user._id);
      toast.success("Added to cart successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  if (!product) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 500,
        }}
      >
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <Container className="p-5 mb-3">
      <NavLink
        to="/our-store"
        className={`nav-link px-2 rounded fw-bold custom-button text-primary border rounded d-inline-block mb-2`}
      >
        &lt; Back to Our Store
      </NavLink>
      <Row>
        <Col md={6} className="text-center">
          <img
            src={`${URL_IMG}${selectedImage || "placeholder.jpg"}`}
            alt={product.name}
            className="img-fluid rounded"
            style={{ width: "100%", maxHeight: 500, objectFit: "contain" }}
          />
          <div className="d-flex justify-content-center mt-3">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={`${URL_IMG}${img || "products/error.jpg"}`}
                alt={`Thumbnail ${index}`}
                className="rounded border mx-1"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  cursor: "pointer",
                  border:
                    selectedImage === img ? "3px solid red" : "1px solid gray",
                }}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </Col>
        <Col md={6}>
          <h2>{product.name}</h2>
          <p style={{ fontSize: 20 }}>{product.description}</p>
          <h6>Select Color:</h6>
          <div className="mb-3 d-flex flex-wrap">
            {product.variants
              ?.filter(
                (v, index, self) =>
                  self.findIndex((t) => t.color === v.color) === index
              )
              .map((variant) => {
                const isOutOfStock = !product.variants.some(
                  (v) => v.color === variant.color && v.stock > 0
                );
                return (
                  <OverlayTrigger
                    key={variant.color}
                    overlay={
                      isOutOfStock ? <Tooltip>Out of stock</Tooltip> : <></>
                    }
                    placement="top"
                  >
                    <div
                      className="position-relative me-2 d-flex align-items-center justify-content-center"
                      style={{
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                      }}
                      onClick={() =>
                        !isOutOfStock && setSelectedColor(variant.color)
                      }
                    >
                      <span
                        className="border rounded-circle d-inline-block"
                        style={{
                          width: 35,
                          height: 35,
                          backgroundColor: colorMap[variant.color],
                          padding: selectedColor === variant.color ? 20 : 0,
                          opacity: isOutOfStock ? 0.5 : 1,
                        }}
                      ></span>
                      {isOutOfStock && (
                        <span
                          className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center text-danger fw-bold"
                          style={{ top: 0, left: 0, fontSize: 20 }}
                        >
                          ✖
                        </span>
                      )}
                    </div>
                  </OverlayTrigger>
                );
              })}
          </div>
          <h6>Select Size:</h6>
          <div className="mb-3 d-flex flex-wrap">
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
              const isOutOfStock = !availableSizes?.includes(size);
              return (
                <OverlayTrigger
                  key={size}
                  overlay={
                    isOutOfStock ? <Tooltip>Out of stock</Tooltip> : <></>
                  }
                  placement="top"
                >
                  <div
                    className="position-relative me-2"
                    style={{
                      display: "inline-block",
                      cursor: isOutOfStock ? "not-allowed" : "pointer",
                    }}
                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                  >
                    <Button
                      variant={selectedSize === size ? "dark" : "light"}
                      disabled={isOutOfStock}
                    >
                      {size}
                    </Button>
                    {isOutOfStock && (
                      <span
                        className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center text-danger fw-bold"
                        style={{ top: 0, left: 0, fontSize: 20 }}
                      >
                        X
                      </span>
                    )}
                  </div>
                </OverlayTrigger>
              );
            })}
          </div>
          <h3 className="my-3">${product.discountPrice || product.price}</h3>
          <Button
            variant="primary"
            className="w-100 mb-2"
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedColor}
          >
            Add to Cart
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
