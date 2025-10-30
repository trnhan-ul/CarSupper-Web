import React, { useEffect, useState, useCallback } from "react";
import { ProductCard } from "../../components/ProductCard";
import Sidebar from "../../components/Sidebar";
import { Container, Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constant";

const OurStore = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams?.get("search") || "";

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGender, selectedCategory, minPrice, maxPrice, searchTerm]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const fetchProducts = useCallback(async () => {
    setIsFetching(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 9,
      });
      if (selectedGender) queryParams.append("gender", selectedGender);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (minPrice) queryParams.append("minPrice", minPrice);
      if (maxPrice) queryParams.append("maxPrice", maxPrice);
      if (searchTerm) queryParams.append("name", searchTerm);
      queryParams.append("status", "active");
      const res = await axios.get(`${API_BASE_URL}/products?${queryParams}`);
      let data = [];
      let pag = { currentPage, totalPages: 1 };
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data.products) {
        data = res.data.products;
        if (res.data.pagination) pag = res.data.pagination;
      } else if (res.data.data) {
        data = res.data.data;
        if (res.data.pagination) pag = res.data.pagination;
      }
      setAllProducts(data);
      setPagination(pag);
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
    } finally {
      setIsFetching(false);
    }
  }, [currentPage, selectedGender, selectedCategory, minPrice, maxPrice, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Container style={{ minHeight: 500 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Our Store</h2>
      </div>
      <div className="d-flex mb-3">
        <Sidebar
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
        />
        <div className="col-md-9 ms-5">
          {isFetching ? (
            <p>Loading products...</p>
          ) : allProducts?.length > 0 ? (
            <>
              <div className="row">
                {allProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="d-flex justify-content-between mt-4">
                <Button disabled={currentPage === 1} onClick={handlePrevPage}>
                  Previous
                </Button>
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  disabled={currentPage === pagination.totalPages}
                  onClick={handleNextPage}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>
    </Container>
  );
};

export default OurStore;
