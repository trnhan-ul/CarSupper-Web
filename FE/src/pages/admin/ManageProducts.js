import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Form,
  Spinner,
  Container,
  Modal,
  Row,
  Col,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  updateStatusProduct,
} from "../../api/productApi";
import { fetchCategories } from "../../api/categoryApi";
import { FaSearch } from "react-icons/fa";
import { URL_IMG } from "../../utils/constant";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false); 
  const [modalType, setModalType] = useState("create");
  const [searchQuery, setSearchQuery] = useState(""); 

  const initialProductState = {
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    images: [],
    variants: [{ size: "", color: "", stock: "" }],
    status: "active",
  };

  const [newProduct, setNewProduct] = useState(initialProductState);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("active");

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const colorOptions = [
    "Black",
    "White",
    "Gray",
    "Navy",
    "Red",
    "Blue",
    "Yellow",
    "Green",
    "Pink",
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetchProducts({ limit: 100 }),
        fetchCategories("active"),
      ]);

      setProducts(productsResponse.products);
      setFilteredProducts(productsResponse.products); 
      setCategories(categoriesResponse.data || categoriesResponse);
    } catch (error) {
      toast.error("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredProducts(products); 
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, products]);

  const handleResetSearch = () => {
    setSearchQuery("");
    setFilteredProducts(products);
  };

  const handleVariantChange = (index, field, value, isEdit = false) => {
    const target = isEdit ? editingProduct : newProduct;
    const setTarget = isEdit ? setEditingProduct : setNewProduct;

    const updatedVariants = [...target.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setTarget({ ...target, variants: updatedVariants });
  };

  const addVariant = (isEdit = false) => {
    const target = isEdit ? editingProduct : newProduct;
    const setTarget = isEdit ? setEditingProduct : setNewProduct;

    setTarget({
      ...target,
      variants: [...target.variants, { size: "", color: "", stock: "" }],
    });
  };

  const removeVariant = (index, isEdit = false) => {
    const target = isEdit ? editingProduct : newProduct;
    const setTarget = isEdit ? setEditingProduct : setNewProduct;

    setTarget({
      ...target,
      variants: target.variants.filter((_, i) => i !== index),
    });
  };

  const handleRemoveImage = (image) => {
    setRemoveImages([...removeImages, image]);
    setEditingProduct({
      ...editingProduct,
      images: editingProduct.images.filter((img) => img !== image),
    });
  };

  const handleSubmit = async (isEdit = false) => {
    const product = isEdit ? editingProduct : newProduct;

    if (!product.name || !product.price || !product.variants.length) {
      toast.error("Please fill all required fields (Name, Price, Variants)!");
      return;
    }

    if (!product.category) {
      toast.error("Please select a category!");
      return;
    }

    for (const variant of product.variants) {
      if (!variant.size || !variant.color || !variant.stock) {
        toast.error("Please fill all variant fields (Size, Color, Stock)!");
        return;
      }
    }

    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(product).forEach(([key, value]) => {
        if (key === "variants") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "images") {
          formData.append(key, value);
        }
      });

      if (isEdit && removeImages.length > 0) {
        formData.append("removeImages", JSON.stringify(removeImages));
      }

      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
      }

      let updatedProduct;
      if (isEdit) {
        updatedProduct = await updateProduct(editingProduct._id, formData);
        setProducts(
          products.map((p) =>
            p._id === editingProduct._id ? updatedProduct : p
          )
        );
        setFilteredProducts(
          filteredProducts.map((p) =>
            p._id === editingProduct._id ? updatedProduct : p
          )
        );
        toast.success("Product updated successfully!");
        setRemoveImages([]);
        setSelectedImages([]);
      } else {
        if (selectedImages.length === 0) {
          toast.error("Please upload at least one image for a new product!");
          setLoading(false);
          return;
        }
        updatedProduct = await createProduct(formData);
        setProducts([...products, updatedProduct]);
        setFilteredProducts([...filteredProducts, updatedProduct]);
        toast.success("Product created successfully!");
        setNewProduct(initialProductState);
        setSelectedImages([]);
      }

      setShowEditModal(false);
    } catch (error) {
      toast.error(
        error.message || `Failed to ${isEdit ? "update" : "create"} product`
      );
    } finally {
      setLoading(false);
      loadData();
    }
  };

  const handleEdit = (product) => {
    const categoryId = product.category?._id || product.category;
    setEditingProduct({
      ...product,
      category: categoryId,
      images: product.images || [],
    });
    setRemoveImages([]);
    setSelectedImages([]);
    setModalType("edit");
    setShowEditModal(true);
  };

  const handleOpenStatusModal = (productId, currentStatus) => {
    setCurrentProductId(productId);
    setCurrentStatus(currentStatus);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!currentProductId) return;

    setLoading(true);
    try {
      await updateStatusProduct(currentProductId, currentStatus);

      toast.success(`Product status updated to ${currentStatus} successfully!`);
      setShowStatusModal(false);
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to update product status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Product Management</h2>

      <Form className="mb-4">
        <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by product name..."
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
        onClick={() => {
          setModalType("create");
          setShowEditModal(true);
        }}
        disabled={loading}
      >
        Add New Product
      </Button>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <Table bordered responsive hover>
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th style={{ width: "12%" }}>Discount Price</th>
              <th>Category</th>
              <th>Variants</th>
              <th>Images</th>
              <th>Status</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>
                  {product.discountPrice ? `$${product.discountPrice}` : "-"}
                </td>
                <td>{product?.category?.name || product.category}</td>
                <td>
                  {product?.variants?.map((v, i) => (
                    <Badge key={i} className="me-1 mb-1" bg="secondary">
                      {v?.size}/{v?.color}: {v?.stock}
                    </Badge>
                  ))}
                </td>
                <td>
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={`${URL_IMG}${img}`}
                      alt={`product-${i}`}
                      width="40"
                      className="me-1"
                    />
                  ))}
                </td>
                <td>
                  <Badge
                    bg={product.status === "active" ? "success" : "danger"}
                  >
                    {product.status}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(product)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() =>
                      handleOpenStatusModal(product._id, product.status)
                    }
                    disabled={loading}
                  >
                    Update Status
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "create" ? "Create New Product" : "Edit Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      modalType === "create"
                        ? newProduct?.name
                        : editingProduct?.name
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      modalType === "create"
                        ? setNewProduct({ ...newProduct, name: value })
                        : setEditingProduct({ ...editingProduct, name: value });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={
                      modalType === "create"
                        ? newProduct?.category || ""
                        : editingProduct?.category || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      modalType === "create"
                        ? setNewProduct({ ...newProduct, category: value })
                        : setEditingProduct({
                            ...editingProduct,
                            category: value,
                          });
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat?._id} value={cat?._id}>
                        {cat?.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type="number"
                    value={
                      modalType === "create"
                        ? newProduct?.price
                        : editingProduct?.price
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      modalType === "create"
                        ? setNewProduct({ ...newProduct, price: value })
                        : setEditingProduct({
                            ...editingProduct,
                            price: value,
                          });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={
                      modalType === "create"
                        ? newProduct?.discountPrice
                        : editingProduct?.discountPrice
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      modalType === "create"
                        ? setNewProduct({ ...newProduct, discountPrice: value })
                        : setEditingProduct({
                            ...editingProduct,
                            discountPrice: value,
                          });
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={
                  modalType === "create"
                    ? newProduct?.description
                    : editingProduct?.description
                }
                onChange={(e) => {
                  const value = e.target.value;
                  modalType === "create"
                    ? setNewProduct({ ...newProduct, description: value })
                    : setEditingProduct({
                        ...editingProduct,
                        description: value,
                      });
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Variants *</Form.Label>
              {(modalType === "create"
                ? newProduct?.variants
                : editingProduct?.variants || []
              ).map((variant, index) => (
                <Row key={index} className="mb-2">
                  <Col md={3}>
                    <Form.Select
                      value={variant?.size || ""}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "size",
                          e.target.value,
                          modalType === "edit"
                        )
                      }
                    >
                      <option value="">Select Size</option>
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={variant?.color || ""}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "color",
                          e.target.value,
                          modalType === "edit"
                        )
                      }
                    >
                      <option value="">Select Color</option>
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      placeholder="Stock"
                      value={variant?.stock}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "stock",
                          e.target.value,
                          modalType === "edit"
                        )
                      }
                    />
                  </Col>
                  <Col md={3}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeVariant(index, modalType === "edit")}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => addVariant(modalType === "edit")}
              >
                Add Variant
              </Button>
            </Form.Group>

            {modalType === "edit" && (
              <Form.Group className="mb-3">
                <Form.Label>Current Images</Form.Label>
                {editingProduct?.images?.length > 0 ? (
                  <div className="mt-2">
                    {editingProduct.images.map((img, i) => (
                      <div
                        key={i}
                        style={{
                          display: "inline-block",
                          position: "relative",
                        }}
                      >
                        <img
                          src={`${URL_IMG}${img}`}
                          alt={`current-${i}`}
                          width="50"
                          className="me-2"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          style={{
                            position: "absolute",
                            top: "-10px",
                            right: "-10px",
                          }}
                          onClick={() => handleRemoveImage(img)}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No current images</p>
                )}
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                {modalType === "create" ? "Images *" : "Add New Images"}
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={(e) => setSelectedImages(Array.from(e.target.files))}
              />
              {selectedImages.length > 0 && (
                <div className="mt-2">
                  {selectedImages.map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      alt={`new-${i}`}
                      width="50"
                      className="me-2"
                    />
                  ))}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => handleSubmit(modalType === "edit")}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Product Status</Modal.Title>
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
    </Container>
  );
};

export default ManageProducts;