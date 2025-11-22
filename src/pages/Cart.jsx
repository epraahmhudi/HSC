import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  const handleRemove = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const handleIncrease = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleDecrease = (id) => {
    const updated = cartItems
      .map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty fade-in">
        <h2>🛒 Your cart is empty</h2>
        <button className="btn-go-shop" onClick={() => navigate("/products")}>
          ← Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="cart-wrapper fade-in">
      <h1 className="cart-page-title">🛍 Your Cart</h1>

      <div className="cart-grid">
        {/* LEFT SIDE — CART LIST */}
        <div className="cart-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-card">
              <img
                src={item.image_url || item.image}
                alt={item.name}
                className="cart-img"
              />

              <div className="cart-details">
                <h3 className="cart-item-title">{item.name}</h3>
                <p className="cart-desc">{item.description}</p>

                <p className="cart-price">
                  ${item.price} × {item.quantity} ={" "}
                  <strong>${item.price * item.quantity}</strong>
                </p>

                <div className="qty-control">
                  <button onClick={() => handleDecrease(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleIncrease(item.id)}>+</button>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.id)}
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE — SUMMARY */}
        <div className="cart-summary-box">
          <h2>Order Summary</h2>
          <p className="summary-total">
            Total: <strong>${totalPrice.toFixed(2)}</strong>
          </p>

          <button className="checkout-btn" onClick={() => navigate("/checkout")}>
            ✅ Proceed to Checkout
          </button>

          <button className="clear-cart-btn" onClick={handleClearCart}>
            🗑 Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
