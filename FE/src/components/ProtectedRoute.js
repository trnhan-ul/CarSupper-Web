import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const current = adminUser || user;

  if (!current) {
    return <Navigate to="/" replace />;
  }

  if (role === "admin" && !current.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
