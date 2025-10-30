import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import { getAllUsers, updateStatusUser } from "../../api/userApi";
import { FaSearch } from "react-icons/fa"; 

const ManageAccounts = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("active");
  const [searchQuery, setSearchQuery] = useState(""); 

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      setFilteredUsers(usersData); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const matchFullName = user.fullName.toLowerCase().includes(query);
      const matchPhone = user.phone && user.phone.toLowerCase().includes(query);
      const matchEmail = user.email.toLowerCase().includes(query);
      return matchFullName || matchPhone || matchEmail;
    });
    setFilteredUsers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, users]);

  const handleResetSearch = () => {
    setSearchQuery("");
    setFilteredUsers(users);
  };

  const handleOpenStatusModal = (userId, currentStatus) => {
    setSelectedUserId(userId);
    setCurrentStatus(currentStatus);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      const updatedUser = await updateStatusUser(selectedUserId, {
        status: currentStatus,
      });
      setUsers(
        users.map((user) =>
          user._id === selectedUserId ? updatedUser : user
        )
      );
      setFilteredUsers(
        filteredUsers.map((user) =>
          user._id === selectedUserId ? updatedUser : user
        )
      );
      toast.success(`User status updated to ${currentStatus} successfully!`);
      setShowStatusModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage User Accounts</h2>

      <Form className="mb-4">
        <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by name, phone, or email..."
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
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers?.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.phone || "N/A"}</td>
              <td>{user.address || "N/A"}</td>
              <td>
                <span
                  className={`badge ${
                    user.status === "active"
                      ? "bg-success"
                      : user.status === "inactive"
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenStatusModal(user._id, user.status)}
                  disabled={loading}
                >
                  Update Status
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update User Status</Modal.Title>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

export default ManageAccounts;