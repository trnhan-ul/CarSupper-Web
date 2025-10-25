import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../../api/cartApi";
import { URL_IMG } from "../../utils/constant";
import { Modal, Button } from "react-bootstrap";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  useEffect(() => {
    if (userId) {
      loadCart();
    } else {
      navigate("/login");
      toast.error("Please log in to view your cart");
    }
  }, [userId, navigate]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await fetchCart(userId);
      setCart(cartData);
      setError(null);

      const initialSelected = {};
      cartData.items.forEach((item) => {
        item.variants.forEach((variant) => {
          initialSelected[`${item.productId._id}-${variant._id}`] = true;
        });
      });
      setSelectedItems(initialSelected);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, variantId, newQuantity) => {
    if (!userId) {
      toast.error("Please log in to update your cart");
      return;
    }
    setLoading(true);
    try {
      const updatedCart = await updateCartQuantity(
        { productId, variantId, quantity: newQuantity },
        userId
      );
      setCart(updatedCart);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId, variantId) => {
    if (!userId) {
      toast.error("Please log in to modify your cart");
      return;
    }
    setLoading(true);
    try {
      const updatedCart = await removeFromCart(
        { productId, variantId },
        userId
      );
      setCart(updatedCart);
      setSelectedItems((prev) => {
        const newSelected = { ...prev };
        delete newSelected[`${productId}-${variantId}`];
        return newSelected;
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!userId) {
      toast.error("Please log in to clear your cart");
      return;
    }
    setLoading(true);
    try {
      await clearCart(userId);
      setCart({ items: [] });
      setSelectedItems({});
      setShowClearModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (key) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calculateTotals = () => {
    if (!cart?.items?.length)
      return { subTotal: 0, shippingFee: 0, grandTotal: 0 };

    let subTotal = 0;
    let selectedCount = 0;

    cart.items.forEach((item) => {
      const product = item.productId;
      const price =
        product.discountPrice !== 0 ? product.discountPrice : product.price;
      item.variants.forEach((variant) => {
        const key = `${item.productId._id}-${variant._id}`;
        if (selectedItems[key]) {
          subTotal += price * variant.quantity;
          selectedCount += variant.quantity;
        }
      });
    });

    const baseShippingFee = 10;
    const discountPerItem = 2;
    const shippingDiscount = Math.min(
      selectedCount * discountPerItem,
      baseShippingFee
    );
    const shippingFee =
      selectedCount >= 5 ? 0 : baseShippingFee - shippingDiscount;

    const grandTotal = subTotal + shippingFee;

    return { subTotal, shippingFee, grandTotal };
  };

  const { subTotal, shippingFee, grandTotal } = calculateTotals();

  const handleCheckoutNavigation = () => {
    console.log("Cart before navigation:", cart);
    console.log("SelectedItems before navigation:", selectedItems);
    navigate("/checkout", { state: { selectedItems, cart } });
  };

  if (loading) {
    return (
      <div
        className="container my-4"
        style={{
          minHeight: 420,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Loading cart...</p>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div
        className="container my-4"
        style={{
          minHeight: 420,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <p>
          No items in cart.{" "}
          <span
            style={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => navigate("/our-store")}
          >
            Shop now
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="container my-4" style={{ minHeight: 420 }}>
      {cart.items?.length && (
        <div className="d-flex justify-content-between mb-2">
          <NavLink
            to="/our-store"
            className={`nav-link px-2 rounded fw-bold custom-button text-primary border rounded`}
          >
            &lt; Back to Our Store
          </NavLink>
          <button
            className="btn btn-danger"
            onClick={() => setShowClearModal(true)}
            disabled={loading}
          >
            Clear Cart
          </button>
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="bg-dark text-white">
            <tr style={{ textAlign: "center" }}>
              <th>Select</th>
              <th>Product Details</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => {
              const product = item.productId;
              const price =
                product.discountPrice !== 0
                  ? product.discountPrice
                  : product.price;
              return item.variants.map((variant) => {
                const key = `${item.productId._id}-${variant._id}`;
                return (
                  <tr key={key}>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedItems[key]}
                        onChange={() => handleToggleSelect(key)}
                        disabled={loading}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={`${URL_IMG}${product.images[0]}`}
                          alt={product.name}
                          width="50"
                          className="me-3"
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <br />
                          <small>Color: {variant.color}</small>
                          <br />
                          <small>Size: {variant.size}</small>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      ${price}
                    </td>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId._id,
                            variant._id,
                            variant.quantity - 1
                          )
                        }
                        disabled={variant.quantity <= 1 || loading}
                      >
                        -
                      </button>
                      <span className="mx-2">{variant.quantity}</span>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId._id,
                            variant._id,
                            variant.quantity + 1
                          )
                        }
                        disabled={loading}
                      >
                        +
                      </button>
                    </td>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      ${selectedItems[key] ? price * variant.quantity : "0"}
                    </td>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          handleRemoveFromCart(item.productId._id, variant._id)
                        }
                        disabled={loading}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col-md-6"></div>
        <div className="col-md-6 text-end">
          <h5>Sub Total: ${subTotal}</h5>
          <h5>Shipping Fee: ${shippingFee}</h5>
          <h4>Grand Total: ${grandTotal}</h4>
          <button
            className="btn btn-success btn-lg mt-3"
            onClick={handleCheckoutNavigation}
            disabled={subTotal === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Clear Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to clear all items from your cart? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowClearModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearCart} disabled={loading}>
            {loading ? "Clearing..." : "Clear Cart"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CartPage;
