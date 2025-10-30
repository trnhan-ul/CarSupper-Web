import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingCart, FaSearch } from "react-icons/fa";
import { Form, Button, Dropdown } from "react-bootstrap";
import { URL_IMG } from "../utils/constant";
import { logout } from "../api/authApi";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      await logout(navigate);
    } catch (error) {
      toast.error(error.message || "Logout failed:");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/our-store?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="bg-dark text-white py-3 fixed-top">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <NavLink to="/" className="nav-link text-white">
            <h4>Car Supper</h4>
          </NavLink>

          <nav
            className="navbar d-flex justify-content-between align-items-center border bg-light px-5 py-2 rounded"
            style={{ width: 500 }}
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link px-2 rounded ${
                  isActive ? "bg-dark text-white" : "text-black"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/our-store"
              className={({ isActive }) =>
                `nav-link px-2 rounded ${
                  isActive ? "bg-dark text-white" : "text-black"
                }`
              }
            >
              Our Store
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link px-2 rounded ${
                  isActive ? "bg-dark text-white" : "text-black"
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `nav-link px-2 rounded ${
                  isActive ? "bg-dark text-white" : "text-black"
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          <Form onSubmit={handleSearch} className="d-flex">
            <Form.Control
              type="text"
              placeholder="Search product"
              className="me-2 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" variant="light">
              <FaSearch />
            </Button>
          </Form>

          <nav className="d-flex align-items-center" style={{ width: "10%" }}>
            <NavLink
              to="/cart"
              className="text-white mx-3"
              style={{ width: "50%" }}
            >
              <FaShoppingCart size={24} />
            </NavLink>
            <div style={{ width: "50%" }}>
              {user ? (
                <Dropdown>
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-basic"
                    className="text-white"
                  >
                    <img
                      src={
                        user.avatar
                          ? `${URL_IMG}${user.avatar}`
                          : "https://cdn-icons-png.flaticon.com/512/219/219988.png"
                      }
                      alt="User Avatar"
                      className="rounded-circle"
                      style={{ width: "30px", height: "30px" }}
                    />
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={NavLink} to="/profile">
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/tracking-order">
                      Tracking Order
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <NavLink to="/login" className="text-white mx-3">
                  <FaUserCircle size={30} />
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
