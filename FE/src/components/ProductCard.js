import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTag } from "react-icons/fa";
import { URL_IMG } from "../utils/constant";
import { addToCart } from "../api/cartApi";
import { toast } from "react-toastify";

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const productImage =
    product.images?.length > 0 ? `${product.images[0]}` : "/products/error.jpg";

  const finalPrice =
    product?.discountPrice !== 0 ? product?.discountPrice : product?.price;

  const isDiscounted =
    product?.discountPrice !== 0 &&
    product?.discountPrice > 0 &&
    product?.discountPrice < product?.price;

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

  return (
    <div className="col-md-4 mb-4">
      <div className="card product-card">
        <Link to={`/product-detail/${product._id}`} className="nav-link">
          <div className="position-relative product-image-container">
            <img
              src={`${URL_IMG}${productImage}`}
              className="card-img-top product-image"
              alt={product.name}
              style={{ height: 230, minHeight: 230, objectFit: "contain" }}
            />
            {isDiscounted && (
              <span className="badge sale-badge">
                <FaTag /> Sale
              </span>
            )}
          </div>
        </Link>

        <div className="card-body text-center">
          <Link to={`/product-detail/${product._id}`} className="nav-link">
            <h5 className="card-title fw-bold">{product.name}</h5>
            <p className="text-muted small">
              {product.category?.name || "Category"}
            </p>
            <div className="d-flex justify-content-center align-items-center">
              <span className="fw-bold text-danger fs-5 me-2">
                ${finalPrice.toLocaleString()}
              </span>
              {isDiscounted && (
                <s className="text-muted">${product.price.toLocaleString()}</s>
              )}
            </div>
          </Link>

          <div className="mt-3 d-flex justify-content-center gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate(`/product-detail/${product._id}`)}
            >
              View Detail
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddToCart}
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
