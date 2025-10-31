import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { addToCart } from "../../api/cartApi";
import axios from "axios";
import { API_BASE_URL, URL_IMG } from "../../utils/constant";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const fetchProductById = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/${productId}`);
      if (res.data && res.data._id) {
        setProduct(res.data);
      } else if (res.data && res.data.data) {
        setProduct(res.data.data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      toast.error("Failed to load product");
      setProduct(null);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductById();
  }, [fetchProductById]);

  useEffect(() => {
    if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!user?._id) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    const cartItem = {
      productId: product._id,
    };

    try {
      await addToCart(cartItem);
      toast.success("Added to cart successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  if (!product) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 500 }}>
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
                style={{ width: 80, height: 80, objectFit: "cover", cursor: "pointer", border: selectedImage === img ? "3px solid red" : "1px solid gray" }}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </Col>
        <Col md={6}>
          <h2>{product.name}</h2>
          <p style={{ fontSize: 20 }}>{product.description}</p>
          <h6>Category:</h6>
          <p>{product.category?.name || "N/A"}</p>
          <h3 className="my-3">${product.discountPrice || product.price}</h3>
          <Button
            variant="primary"
            className="w-100 mb-2"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
