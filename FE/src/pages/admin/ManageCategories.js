import React, { useState, useEffect, useCallback } from "react";
import { Container, Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import { FaEdit, FaSyncAlt, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  fetchCategories,
  createCategory,
  editCategory,
  updateCategoryStatus,
} from "../../api/categoryApi";
import { toast } from "react-toastify";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
  });
  const [currentStatus, setCurrentStatus] = useState("active");
  const [categoryId, setCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const adminUser = JSON.parse(localStorage.getItem("adminUser"));
    const current = adminUser || user;
    if (!current?.isAdmin) {
      toast.error("You do not have permission to access this page.");
      navigate("/");
      return;
    }
    fetchAllCategories();
  }, [navigate /* eslint-disable-line react-hooks/exhaustive-deps */]);

  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    try {
      const categoryData = await fetchCategories();
      setCategories(categoryData);
      setFilteredCategories(categoryData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleResetSearch = () => {
    setSearchQuery("");
    setFilteredCategories(categories);
  };

  const handleOpenEditModal = (category = null) => {
    if (category) {
      setIsEdit(true);
      setCategoryId(category._id);
      setCurrentCategory({
        name: category.name,
      });
    } else {
      setIsEdit(false);
      setCurrentCategory({ name: "" });
    }
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentCategory({ name: "" });
    setCategoryId(null);
  };

  const handleOpenStatusModal = (category) => {
    setCategoryId(category._id);
    setCurrentStatus(category.status);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setCategoryId(null);
    setCurrentStatus("active");
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const updatedCategory = await editCategory(categoryId, currentCategory);
        setCategories(
          categories.map((cat) =>
            cat._id === categoryId ? updatedCategory : cat
          )
        );
        setFilteredCategories(
          filteredCategories.map((cat) =>
            cat._id === categoryId ? updatedCategory : cat
          )
        );
        toast.success("Category updated successfully!");
      } else {
        const newCategory = await createCategory(currentCategory);
        setCategories([...categories, newCategory]);
        setFilteredCategories([...filteredCategories, newCategory]);
        toast.success("Category created successfully!");
      }
      handleCloseEditModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const updatedCategory = await updateCategoryStatus(
        categoryId,
        currentStatus
      );
      setCategories(
        categories.map((cat) =>
          cat._id === categoryId ? updatedCategory : cat
        )
      );
      setFilteredCategories(
        filteredCategories.map((cat) =>
          cat._id === categoryId ? updatedCategory : cat
        )
      );
      toast.success(
        `Category status updated to ${currentStatus} successfully!`
      );
      handleCloseStatusModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Category Management</h2>

      <Form className="mb-4">
        <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by category name..."
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

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => handleOpenEditModal()}
        disabled={loading}
      >
        Add New Category
      </Button>

      {loading ? (
        <p>Loading...</p>
      ) : filteredCategories.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: 400 }}>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>
                  <span
                    style={{
                      color: category.status === "active" ? "green" : "orange",
                      fontWeight: "bold",
                    }}
                  >
                    {category.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ display: "flex", justifyContent: "space-around" }}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenEditModal(category)}
                    disabled={loading}
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleOpenStatusModal(category)}
                    disabled={loading}
                  >
                    <FaSyncAlt /> Update Status
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No categories found.</p>
      )}

      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveCategory}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={currentCategory.name}
                onChange={(e) =>
                  setCurrentCategory({
                    ...currentCategory,
                    name: e.target.value,
                  })
                }
                required
                disabled={loading}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading}>
              {isEdit ? "Update" : "Create"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showStatusModal} onHide={handleCloseStatusModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Category Status</Modal.Title>
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
              Update Status
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CategoryManagement;