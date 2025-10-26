import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
const LayoutUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <Header />
      <div style={{ marginTop: 100 }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default LayoutUser;
