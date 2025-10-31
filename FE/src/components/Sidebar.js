import React, { useEffect, useState } from "react";
import { fetchCategories } from "../api/categoryApi";

const Sidebar = ({
  selectedCategory,
  setSelectedCategory,
  setMinPrice,
  setMaxPrice,
}) => {
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryData = await fetchCategories();
        setCategories(categoryData);
        setIsFetching(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setIsFetching(false);
      }
    };

    fetchCategoryData();
  }, []);

  const handlePriceChange = () => {
    setMinPrice(minInput);
    setMaxPrice(maxInput);
  };

  return (
    <div className="col-md-3">
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title text-center">Shop By Categories</h5>
          {isFetching ? (
            <p>Loading categories...</p>
          ) : (
            <div className="row">
              <div className="col-6 mb-2">
                <button
                  className={`btn ${selectedCategory === ""
                    ? "btn-primary"
                    : "btn-outline-primary"
                    } w-100`}
                  onClick={() => setSelectedCategory("")}
                >
                  All
                </button>
              </div>
              {categories
                ?.filter((cat) => cat.status === "active")
                ?.map((category) => (
                  <div key={category._id} className="col-6 mb-2">
                    <button
                      className={`btn ${selectedCategory === category.name
                        ? "btn-primary"
                        : "btn-outline-primary"
                        } w-100`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Filter By</h5>
          <div className="mb-4">
            <h6>Price</h6>
            <div className="form-row d-flex gap-2">
              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="$ from"
                  value={minInput}
                  min={1}
                  onChange={(e) => setMinInput(e.target.value)}
                />
              </div>
              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="$ to"
                  value={maxInput}
                  min={1}
                  onChange={(e) => setMaxInput(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-primary w-100 mt-3"
              onClick={handlePriceChange}
            >
              Apply Price Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
