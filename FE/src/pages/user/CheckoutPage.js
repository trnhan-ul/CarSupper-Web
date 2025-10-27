import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createOrder } from "../../api/orderApi";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedItems, cart } = location.state || {};

  const [billingInfo, setBillingInfo] = useState({
    fullName: JSON.parse(localStorage.getItem("user"))?.fullName || "",
    phone: JSON.parse(localStorage.getItem("user"))?.phone || "",
    address: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const calculateOrderDetails = () => {
    if (!cart?.items?.length || !selectedItems) {
      return { items: [], subTotal: 0, shippingFee: 0, grandTotal: 0 };
    }

    let subTotal = 0;
    let selectedCount = 0;
    const orderItems = [];

    cart.items.forEach((item) => {
      const product = item.productId;
      const price =
        product.discountPrice !== 0 ? product.discountPrice : product.price;

      item.variants.forEach((variant) => {
        const key = `${item.productId._id}-${variant._id}`;
        if (selectedItems[key]) {
          subTotal += price * variant.quantity;
          selectedCount += variant.quantity;
          orderItems.push({
            productId: item.productId._id,
            variant: {
              size: variant.size,
              color: variant.color,
              quantity: variant.quantity,
            },
          });
        }
      });
    });

    const baseShippingFee = 10;
    const discountPerItem = 2;
    const shippingDiscount = Math.min(
      selectedCount * discountPerItem,
      baseShippingFee
    );
    const shippingFee =
      selectedCount >= 5 ? 0 : baseShippingFee - shippingDiscount;
    const grandTotal = subTotal + shippingFee;

    return { items: orderItems, subTotal, shippingFee, grandTotal };
  };

  const { items, subTotal, shippingFee, grandTotal } = calculateOrderDetails();

  const handleCheckout = async () => {
    if (!billingInfo.address) {
      toast.error("Please enter your shipping address");
      return;
    }
    if (!items.length) {
      toast.error("No items selected for checkout");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;

      const orderData = {
        userId,
        items,
        shippingAddress: billingInfo?.address,
        note: billingInfo?.note || "",
        shippingCost: shippingFee,
      };
      await createOrder(orderData);
      toast.success("Order placed successfully!");
      navigate("/tracking-order");
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !selectedItems) {
    return (
      <div className="container mt-4" style={{ minHeight: 500 }}>
        <h4>🛒 Check Out</h4>
        <p>Please go through the cart to proceed with checkout.</p>
        <Link to="/cart" className="btn btn-primary">
          Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ minHeight: 500 }}>
      <h4>🛒 Check Out</h4>
      <div className="row">
        <div className="col-md-8">
          <h5>Billing Details</h5>
          <input
            type="text"
            className="form-control mb-2"
            value={billingInfo.fullName}
            readOnly
          />
          <input
            type="text"
            className="form-control mb-2"
            value={billingInfo.phone}
            readOnly
          />
          <input
            type="text"
            className="form-control mb-2"
            value={billingInfo.address}
            onChange={(e) =>
              setBillingInfo((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Enter shipping address"
            required
          />
          <input
            type="text"
            className="form-control mb-2"
            value={billingInfo.note}
            onChange={(e) =>
              setBillingInfo((prev) => ({ ...prev, note: e.target.value }))
            }
            placeholder="Order note (optional)"
          />
          <h5 className="mt-4">Payment Method</h5>
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={true}
              disabled
            />
            <label className="form-check-label">Cash on Delivery</label>
          </div>
          <button
            className="btn btn-success btn-lg mt-3"
            onClick={handleCheckout}
            disabled={loading || !items.length}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
        <div className="col-md-4">
          <h5>Order Summary</h5>
          <ul className="list-group">
            {items.length === 0 && (
              <li className="list-group-item">No items selected</li>
            )}
            {items.map((item, index) => {
              const product = cart.items.find(
                (i) => i.productId._id === item.productId
              )?.productId;
              const variant = cart.items
                .find((i) => i.productId._id === item.productId)
                ?.variants.find(
                  (v) =>
                    v.size === item.variant.size &&
                    v.color === item.variant.color
                );
              const price =
                product.discountPrice !== 0
                  ? product.discountPrice
                  : product.price;
              return (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>
                    {product.name} ({variant.size}, {variant.color})
                  </span>
                  <strong>${(price * variant.quantity).toFixed(2)}</strong>
                </li>
              );
            })}
            <li className="list-group-item d-flex justify-content-between">
              <span>Subtotal</span>
              <strong>${subTotal.toFixed(2)}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Shipping</span>
              <strong>${shippingFee.toFixed(2)}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <strong>Total</strong>
              <strong>${grandTotal.toFixed(2)}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
