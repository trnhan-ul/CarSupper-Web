import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { getAllOrders, updateOrderStatusByAdmin } from "../../api/orderApi";
import { FaSearch, FaEye } from "react-icons/fa";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await getAllOrders();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = useCallback(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      const userEmail = order.userId?.email?.toLowerCase() || "";
      return userEmail.includes(query);
    });
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleResetSearch = () => {
    setSearchQuery("");
    setFilteredOrders(orders);
  };

  const handleOpenStatusModal = (orderId, currentStatus) => {
    setSelectedOrderId(orderId);
    setCurrentStatus(currentStatus);
    setShowStatusModal(true);
  };

  const handleOpenDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrderId) return;

    setLoading(true);
    try {
      const updatedOrder = await updateOrderStatusByAdmin(
        selectedOrderId, // <-- Tham số THỨ NHẤT: là chuỗi ID
        { status: currentStatus } // <-- Tham số THỨ HAI: là đối tượng payload
      );
      setOrders(
        orders.map((order) =>
          order._id === selectedOrderId ? updatedOrder : order
        )
      );
      setFilteredOrders(
        filteredOrders.map((order) =>
          order._id === selectedOrderId ? updatedOrder : order
        )
      );
      toast.success(`Order status updated to ${currentStatus} successfully!`);
      setShowStatusModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Orders</h2>

      <Form className="mb-4">
        <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by user email or name..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button
            variant="secondary"
            onClick={handleResetSearch}
            disabled={loading || !searchQuery}
          >
            Reset
          </Button>
        </InputGroup>
      </Form>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>User Email</th>
            <th>Total Amount</th>
            <th>Shipping Address</th>
            <th>Items</th>
            <th>Status</th>
            <th>Created At</th>
            <th style={{ width: 240 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders?.map((order, index) => (
            <tr key={order._id}>
              <td>{index + 1}</td>
              <td>{order.userId?.email}</td>
              <td>${order.totalAmount.toFixed(2)}</td>
              <td>{order.shippingAddress}</td>
              <td>
                {order.items?.map((item, i) => (
                  <div key={i}>
                    {i + 1}. {item.productId?.name}
                  </div>
                ))}
              </td>
              <td>
                <Badge
                  bg={
                    order.status === "pending"
                      ? "warning"
                      : order.status === "in_progress"
                        ? "info"
                        : order.status === "done"
                          ? "success"
                          : "danger"
                  }
                >
                  {order.status}
                </Badge>
              </td>

              <td>{formatDate(order.createdAt)}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleOpenDetailsModal(order)}
                  disabled={loading}
                >
                  <FaEye /> View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    console.log("order._id:", order._id, "Type:", typeof order._id);
                    handleOpenStatusModal(order._id, order.status);
                  }}
                  disabled={
                    loading || order.isDeleted || order.status === "cancelled"
                  }
                >
                  Update Status
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal để xem chi tiết */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <h5>Order Information</h5>
              <p>
                <strong>User Email:</strong> {selectedOrder.userId?.email}
              </p>
              <p>
                <strong>Total Amount:</strong> $
                {selectedOrder.totalAmount.toFixed(2)}
              </p>
              <p>
                <strong>Shipping Address:</strong>{" "}
                {selectedOrder.shippingAddress}
              </p>
              <p>
                <strong>Shipping Cost:</strong> $
                {selectedOrder.shippingCost.toFixed(2)}
              </p>
              <p>
                <strong>Note:</strong> {selectedOrder.note || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>
                <Badge
                  bg={
                    selectedOrder.status === "pending"
                      ? "warning"
                      : selectedOrder.status === "in_progress"
                        ? "info"
                        : selectedOrder.status === "done"
                          ? "success"
                          : "danger"
                  }
                >
                  {selectedOrder.status}
                </Badge>
              </p>
              <p>
                <strong>Feedback:</strong> {selectedOrder.feedback || "N/A"}
              </p>
              <p>
                <strong>Deleted:</strong>
                <Badge bg={selectedOrder.isDeleted ? "danger" : "success"}>
                  {selectedOrder.isDeleted ? "Yes" : "No"}
                </Badge>
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {formatDate(selectedOrder.createdAt)}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {formatDate(selectedOrder.updatedAt)}
              </p>

              <h5>Items</h5>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="mb-2">
                  <p>
                    <strong>Product:</strong> {item.productId?.name}
                  </p>
                  <p>
                    <strong>Price:</strong> ${item.price?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal để cập nhật trạng thái */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                disabled={loading}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleUpdateStatus}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Update Status"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageOrders;
