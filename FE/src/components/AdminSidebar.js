import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaList,
  FaUsers,
  FaShoppingCart,
  FaSignOutAlt,
  FaCar,
} from "react-icons/fa";
import { logout } from "../api/authApi";
import { toast } from "react-toastify";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(navigate);
    } catch (error) {
      toast.error(error.message || "Failed to logout");
    }
  };

  const menuItems = [
    { to: "/admin", icon: FaTachometerAlt, label: "Dashboard", end: true },
    { to: "/admin/products", icon: FaBox, label: "Manage Products" },
    { to: "/admin/categories", icon: FaList, label: "Manage Categories" },
    { to: "/admin/accounts", icon: FaUsers, label: "Manage Accounts" },
    { to: "/admin/orders", icon: FaShoppingCart, label: "Manage Orders" },
  ];

  return (
    <aside
      style={{
        width: "280px",
        left: 0,
        top: 0,
        bottom: 0,
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
      }}
      className="text-white p-0 vh-100 position-fixed d-flex flex-column"
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "25px 20px",
          borderBottom: "3px solid rgba(255,255,255,0.1)",
        }}
        className="text-center"
      >
        <FaCar style={{ fontSize: "2.5rem", marginBottom: "10px" }} />
        <h4 style={{
          margin: 0,
          fontWeight: "700",
          letterSpacing: "1px",
          textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
        }}>
          CarSupper Admin
        </h4>
        <p style={{
          margin: "5px 0 0 0",
          fontSize: "0.85rem",
          opacity: 0.9,
          fontWeight: "300"
        }}>
          Management Portal
        </p>
      </div>

      {/* Menu Items */}
      <ul className="list-unstyled flex-grow-1 px-3 py-4" style={{ overflowY: "auto" }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={index} style={{ marginBottom: "8px" }}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center p-3 ${isActive ? "" : ""
                  }`
                }
                style={({ isActive }) => ({
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  fontWeight: isActive ? "600" : "500",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  background: isActive
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                  color: isActive ? "#fff" : "#cbd5e1",
                  boxShadow: isActive
                    ? "0 4px 15px rgba(102, 126, 234, 0.4)"
                    : "none",
                  transform: isActive ? "translateX(5px)" : "translateX(0)",
                })}
              >
                <Icon className="me-3" style={{ fontSize: "1.2rem" }} />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div style={{
        padding: "20px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.2)"
      }}>
        <button
          className="btn w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
          style={{
            background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "0.95rem",
            boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(220, 53, 69, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
          }}
        >
          <FaSignOutAlt className="me-2" style={{ fontSize: "1.1rem" }} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
