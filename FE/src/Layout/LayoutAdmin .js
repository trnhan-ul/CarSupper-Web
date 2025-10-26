import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/AdminSidebar";

const LayoutAdmin = () => {
  return (
    <div className="d-flex vh-100" style={{ backgroundColor: "#f1f5f9" }}>
      <Sidebar />

      <main
        className="flex-grow-1"
        style={{
          marginLeft: "280px",
          overflowY: "auto",
          padding: "0"
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutAdmin;
