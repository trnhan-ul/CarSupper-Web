import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RegisterPage from "../pages/user/RegisterPage";
import LayoutUser from "../Layout/LayoutUser";
import LayoutAdmin from "../Layout/LayoutAdmin ";
// import HomePage from "../pages/user/HomePage";
// import ProductDetail from "../pages/user/ProductDetail";
// import CartPage from "../pages/user/CartPage";
// import CheckoutPage from "../pages/user/CheckoutPage";
import ProfilePage from "../pages/user/ProfilePage";
import LoginPage from "../pages/user/LoginPage";
import ForgotPasswordPage from "../pages/user/ForgotPasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";
import ManageAccounts from "../pages/admin/ManageAccounts";
// import ManageStatistics from "../pages/admin/ManageStatistics";

// import OurStore from "../pages/user/OurStore";
// import ContactPage from "../pages/user/ContactPage";
// import AboutPage from "../pages/user/AboutPage";
// import ManageProducts from "../pages/admin/ManageProducts";
// import ManageCategories from "../pages/admin/ManageCategories";

// import ManageOrders from "../pages/admin/ManageOrders";

// import ScrollToTop from "../components/ScrollToTop";
// import TrackingOrderPage from "../pages/user/TrackingOrderPage";


function AppNavigator() {
  return (
    <Router>
      {/* <ScrollToTop /> */}
      <Routes>
        <Route path="/" element={<LayoutUser />}>
          {/* <Route index element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/our-store" element={<OurStore />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/product-detail/:productId"
            element={<ProductDetail />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/tracking-order" element={<TrackingOrderPage />} />
          <Route path="/checkout" element={<CheckoutPage />} /> */}

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <LayoutAdmin />
            </ProtectedRoute>
          }
        >
          {/* <Route index element={<ManageStatistics />} /> */}
          {/* <Route path="products" element={<ManageProducts />} />
          <Route path="categories" element={<ManageCategories />} /> */}
          <Route path="accounts" element={<ManageAccounts />} />
          {/* <Route path="orders" element={<ManageOrders />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default AppNavigator;
