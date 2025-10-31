import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCart, removeFromCart, clearCart } from "../../api/cartApi";
import { URL_IMG } from "../../utils/constant";
import { Modal, Button } from "react-bootstrap";

const CartPage = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?._id) {
      loadCart();
    } else {
      navigate("/login");
      toast.error("Please log in to view your cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await fetchCart();
      const items = cartData?.items || [];
      setCart({ items });
      setError(null);

      // chọn tất cả theo mặc định
      const initialSelected = {};
      items.forEach((item) => {
        initialSelected[item.productId._id] = true;
      });
      setSelectedItems(initialSelected);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    setLoading(true);
    try {
      const updatedCart = await removeFromCart(productId);
      setCart({ items: updatedCart?.items || [] });
      setSelectedItems((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    setLoading(true);
    try {
      await clearCart();
      setCart({ items: [] });
      setSelectedItems({});
      setShowClearModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (productId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const calculateTotals = () => {
    if (!cart?.items?.length) return { subTotal: 0, shippingFee: 0, grandTotal: 0 };

    let subTotal = 0;
    let selectedCount = 0;

    cart.items.forEach((item) => {
      const product = item.productId;
      const price = product.discountPrice !== 0 ? product.discountPrice : product.price;
      if (selectedItems[product._id]) {
        subTotal += price; // mỗi xe 1 chiếc
        selectedCount += 1;
      }
    });

    const baseShippingFee = 10;
    const discountPerItem = 2;
    const shippingDiscount = Math.min(selectedCount * discountPerItem, baseShippingFee);
    const shippingFee = selectedCount >= 5 ? 0 : baseShippingFee - shippingDiscount;
    const grandTotal = subTotal + shippingFee;

    return { subTotal, shippingFee, grandTotal };
  };

  const { subTotal, shippingFee, grandTotal } = calculateTotals();

  const handleCheckoutNavigation = () => {
    navigate("/checkout", { state: { selectedItems, cart } });
  };

  if (loading) {
    return (
      <div className="container my-4" style={{ minHeight: 420, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4" style={{ minHeight: 420 }}>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container my-4" style={{ minHeight: 420, justifyContent: "center", alignItems: "center", display: "flex" }}>
        <p>
          No items in cart. {" "}
          <span style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/our-store")}>
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
          <NavLink to="/our-store" className={`nav-link px-2 rounded fw-bold custom-button text-primary border rounded`}>
            &lt; Back to Our Store
          </NavLink>
          <button className="btn btn-danger" onClick={() => setShowClearModal(true)} disabled={loading}>
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
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => {
              const product = item.productId;
              const price = product.discountPrice !== 0 ? product.discountPrice : product.price;
              const key = product._id;
              return (
                <tr key={key}>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <input type="checkbox" checked={!!selectedItems[key]} onChange={() => handleToggleSelect(key)} disabled={loading} />
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <img src={`${URL_IMG}${product.images?.[0]}`} alt={product.name} width="50" className="me-3" />
                      <div>
                        <strong>{product.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>${price}</td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>${selectedItems[key] ? price : "0"}</td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveFromCart(product._id)} disabled={loading}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
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
          <button className="btn btn-success btn-lg mt-3" onClick={handleCheckoutNavigation} disabled={subTotal === 0}>
            Proceed to Checkout
          </button>
        </div>
      </div>

      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Clear Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to clear all items from your cart? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)} disabled={loading}>
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
