import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Home
        </Link>
        <Link to="/contact" className="nav-link">
          Contact
        </Link>
        <Link to="/category" className="nav-link">
          Category
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
