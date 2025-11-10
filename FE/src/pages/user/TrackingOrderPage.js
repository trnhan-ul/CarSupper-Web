import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { URL_IMG } from "../../utils/constant";
import {
  getOrdersByUser,
  cancelOrderByUser,
  softDeleteOrder,
  addFeedbackToOrder,
} from "../../api/orderApi";
import { Modal, Button, Form } from "react-bootstrap";

const TrackingOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionType, setActionType] = useState(""); 
  const [feedback, setFeedback] = useState(""); 
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user?._id;

  useEffect(() => {
    if (userId) {
      loadOrders();
    } else {
      navigate("/login");
      toast.error("Please log in to view your orders");
    }
  }, [userId, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const orderData = await getOrdersByUser();
      setOrders(orderData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await cancelOrderByUser({ orderId: selectedOrderId });
      toast.success("Order cancelled successfully");
      loadOrders();
      setShowModal(false); // Close modal
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    setLoading(true);
    try {
      await softDeleteOrder(selectedOrderId);
      toast.success("Order deleted successfully");
      loadOrders();
      setShowModal(false); // Close modal
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async () => {
    setLoading(true);
    try {
      await addFeedbackToOrder(selectedOrderId, { feedback });
      toast.success("Feedback added successfully");
      loadOrders();
      setShowModal(false); // Close modal
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (orderId, action) => {
    setSelectedOrderId(orderId);
    setActionType(action); // Set action type for the modal
    setShowModal(true);
    if (action === "feedback") {
      setFeedback(""); // Clear feedback if opening feedback modal
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrderId(null);
    setActionType(""); // Reset action type
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
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
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
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!orders?.length) {
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
          No orders found.{" "}
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
    <div className="container my-4" style={{ minHeight: 500 }}>
      <Link
        to="/our-store"
        className="nav-link px-2 rounded fw-bold custom-button text-primary border rounded d-inline-block mb-2"
      >
        &lt; Back to Our Store
      </Link>
      <h3 className="mb-3">Your Orders</h3>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="bg-dark text-white">
            <tr style={{ textAlign: "center" }}>
              <th>Order ID</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Shipping Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order._id}>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  {order._id}
                </td>
                <td>
                  {order.items.map((item) => {
                    const product = item.productId;
                    const variant = item.variant && item.variant[0];
                    return (
                      <div
                        key={`${product._id}-${variant?.size}-${variant?.color}`}
                        className="d-flex align-items-center mb-2"
                      >
                        <img
                          src={`${URL_IMG}${product?.images[0]}`}
                          alt={product?.name}
                          width="50"
                          className="me-3"
                        />
                        <div>
                          <strong>{product?.name}</strong>
                        </div>
                      </div>
                    );
                  })}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  ${order.totalAmount}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  {order.shippingAddress}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  <span
                    className={`badge ${
                      order.status === "pending"
                        ? "bg-warning"
                        : order.status === "in_progress"
                        ? "bg-info"
                        : order.status === "done"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {order?.status}
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  {order.status === "pending" && (
                    <button
                      className="btn btn-danger btn-sm mb-1"
                      onClick={() => openModal(order._id, "cancel")}
                      disabled={loading}
                    >
                      <FaTrash /> Cancel
                    </button>
                  )}
                  {(order.status === "done" || order.status === "cancelled") &&
                    !order.isDeleted &&
                    !order.feedback && (
                      <button
                        className="btn btn-info btn-sm mb-1"
                        onClick={() => openModal(order._id, "feedback")}
                        disabled={loading}
                      >
                        Add Feedback
                      </button>
                    )}
                  {(order.status === "done" || order.status === "cancelled") &&
                    !order.isDeleted && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openModal(order._id, "delete")}
                        disabled={loading}
                      >
                        <FaTrash /> Delete
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === "cancel"
              ? "Cancel Order"
              : actionType === "delete"
              ? "Delete Order"
              : "Add Feedback"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === "feedback" ? (
            <Form.Control
              as="textarea"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
            />
          ) : (
            `Are you sure you want to ${actionType} this order?`
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button
            variant={
              actionType === "cancel"
                ? "warning"
                : actionType === "feedback"
                ? "primary"
                : "danger"
            }
            onClick={
              actionType === "cancel"
                ? handleCancelOrder
                : actionType === "delete"
                ? handleDeleteOrder
                : handleAddFeedback
            }
            disabled={loading}
          >
            {actionType === "cancel"
              ? "Confirm Cancel Order"
              : actionType === "delete"
              ? "Delete Order"
              : "Submit Feedback"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TrackingOrderPage;
