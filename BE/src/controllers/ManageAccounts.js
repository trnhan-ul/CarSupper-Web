import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, InputGroup, Badge, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { getAllUsers, updateStatusUser } from "../../../FE/src/api/userApi";
import { FaSearch, FaUserEdit, FaCheckCircle, FaBan, FaTimesCircle } from "react-icons/fa";

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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "30px 40px"
    }}>
      {/* Header Section */}
      <Card
        className="mb-4"
        style={{
          border: "none",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}
      >
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 style={{
                margin: 0,
                fontWeight: "700",
                fontSize: "1.8rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
              }}>
                👥 User Account Management
              </h2>
              <p style={{ margin: "8px 0 0 0", opacity: 0.95, fontSize: "0.95rem" }}>
                Manage and monitor all user accounts in the system
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.2)",
              padding: "15px 25px",
              borderRadius: "12px",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>Total Users</div>
              <div style={{ fontSize: "2rem", fontWeight: "700" }}>{filteredUsers?.length || 0}</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Search Section */}
      <Card
        className="mb-4"
        style={{
          border: "none",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
        }}
      >
        <Card.Body className="p-4">
          <Form>
            <InputGroup style={{ maxWidth: "500px" }}>
              <InputGroup.Text style={{
                background: "white",
                border: "2px solid #e2e8f0",
                borderRight: "none"
              }}>
                <FaSearch style={{ color: "#667eea" }} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  border: "2px solid #e2e8f0",
                  borderLeft: "none",
                  borderRight: "none",
                  padding: "12px 15px",
                  fontSize: "0.95rem"
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={handleResetSearch}
                disabled={loading || !searchQuery}
                style={{
                  border: "2px solid #e2e8f0",
                  borderLeft: "none",
                  padding: "12px 20px",
                  fontWeight: "600",
                  background: searchQuery ? "#f8fafc" : "white"
                }}
              >
                Reset
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Table Section */}
      <Card
        style={{
          border: "none",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          overflow: "hidden"
        }}
      >
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner
                animation="border"
                style={{
                  width: "3rem",
                  height: "3rem",
                  color: "#667eea"
                }}
              />
              <p style={{ marginTop: "15px", color: "#64748b", fontWeight: "500" }}>
                Loading users...
              </p>
            </div>
          ) : filteredUsers?.length === 0 ? (
            <div className="text-center py-5">
              <FaTimesCircle style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "15px" }} />
              <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: "500" }}>
                No users found
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table hover className="mb-0" style={{ minWidth: "800px" }}>
                <thead style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                  borderBottom: "2px solid #cbd5e1"
                }}>
                  <tr>
                    <th style={{ padding: "18px 20px", fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>#</th>
                    <th style={{ padding: "18px 20px", fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</th>
                    <th style={{ padding: "18px 20px", fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</th>
                    <th style={{ padding: "18px 20px", fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Phone</th>
                    <th style={{ padding: "18px 20px", fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Address</th>
                    <th style={{ padding: "18px 20px", fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "18px 20px", fontWeight: "700", color: "#1e293b", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers?.map((user, index) => (
                    <tr
                      key={user._id}
                      style={{
                        transition: "all 0.2s ease",
                        borderBottom: "1px solid #f1f5f9"
                      }}
                    >
                      <td style={{ padding: "20px", fontWeight: "600", color: "#64748b" }}>{index + 1}</td>
                      <td style={{ padding: "20px", fontWeight: "600", color: "#1e293b" }}>{user.fullName}</td>
                      <td style={{ padding: "20px", color: "#64748b", fontSize: "0.9rem" }}>{user.email}</td>
                      <td style={{ padding: "20px", color: "#64748b", fontSize: "0.9rem" }}>{user.phone || <span style={{ color: "#cbd5e1" }}>N/A</span>}</td>
                      <td style={{ padding: "20px", color: "#64748b", fontSize: "0.9rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.address || <span style={{ color: "#cbd5e1" }}>N/A</span>}
                      </td>
                      <td style={{ padding: "20px", textAlign: "center" }}>
                        <Badge
                          bg=""
                          style={{
                            background: user.status === "active"
                              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                              : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            textTransform: "capitalize",
                            boxShadow: user.status === "active"
                              ? "0 2px 8px rgba(16, 185, 129, 0.3)"
                              : "0 2px 8px rgba(245, 158, 11, 0.3)"
                          }}
                        >
                          {user.status === "active" ? (
                            <><FaCheckCircle className="me-1" /> Active</>
                          ) : (
                            <><FaBan className="me-1" /> Inactive</>
                          )}
                        </Badge>
                      </td>
                      <td style={{ padding: "20px", textAlign: "center" }}>
                        <Button
                          size="sm"
                          onClick={() => handleOpenStatusModal(user._id, user.status)}
                          disabled={loading}
                          style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            padding: "8px 20px",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                            transition: "all 0.3s ease"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
                          }}
                        >
                          <FaUserEdit className="me-1" /> Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none"
          }}
        >
          <Modal.Title style={{ fontWeight: "700", fontSize: "1.3rem" }}>
            🔄 Update User Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "30px" }}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: "600", color: "#1e293b", marginBottom: "12px" }}>
                Select New Status
              </Form.Label>
              <Form.Select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                disabled={loading}
                style={{
                  padding: "12px 15px",
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0",
                  fontSize: "1rem",
                  fontWeight: "500"
                }}
              >
                <option value="active">✅ Active</option>
                <option value="inactive">⛔ Inactive</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowStatusModal(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  border: "none"
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                }}
              >
                {loading ? (
                  <><Spinner size="sm" className="me-2" /> Updating...</>
                ) : (
                  "✓ Confirm Update"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageAccounts;