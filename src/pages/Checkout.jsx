import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Checkout.css";

import evcImg from "../assets/evc.png";
import sahalImg from "../assets/sahal.png";
import cashImg from "../assets/cash.png";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState("");

  const [loggedUser, setLoggedUser] = useState(null);

  const [formData, setFormData] = useState({
    paymentMethod: "",
    phoneNumber: "",
    pin: "",
    name: "",
    email: "",
    address: "",
  });

  // Load cart + user
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);

    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setLoggedUser(savedUser);
      setFormData((prev) => ({
        ...prev,
        name: savedUser.name,
        email: savedUser.email,
      }));
    }
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectMethod = (method) => {
    setFormData({ ...formData, paymentMethod: method });
  };

  const handlePayment = (e) => {
    e.preventDefault();

    if (!formData.paymentMethod) {
      alert("Please select a payment method!");
      return;
    }

    if (formData.paymentMethod === "Cash on Delivery") {
      if (!formData.name || !formData.email || !formData.address) {
        alert("Please fill in your delivery information!");
        return;
      }
      completePayment();
      return;
    }

    if (["SAHAL", "EVC+"].includes(formData.paymentMethod)) {
      if (!formData.phoneNumber) {
        alert(`Please enter your ${formData.paymentMethod} number!`);
        return;
      }
      setSelectedOperator(formData.paymentMethod);
      setShowPinPrompt(true);
    }
  };

  const handleSendPayment = (e) => {
    e.preventDefault();

    if (!formData.pin) {
      alert("Please enter your PIN!");
      return;
    }

    setShowPinPrompt(false);
    completePayment();
  };

  // ============================================================
  // SAVE ORDER TO SUPABASE using CUSTOM users table
  // ============================================================
  const saveOrderToSupabase = async () => {
    try {
      let user_id = loggedUser ? loggedUser.id : null;

      const fullName = formData.name || "Unknown";
      const email = formData.email || "Unknown";

      // Insert into orders_main
      const { data: orderMain, error: orderError } = await supabase
        .from("orders_main")
        .insert([
          {
            user_id,
            customer_name: fullName,
            customer_email: email,
            customer_address: formData.address || "Unknown",
            payment_method: formData.paymentMethod,
            phone_number: formData.phoneNumber || null,
            total_price: total,
            status: "Completed",
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.log("Order Error:", orderError);
        alert("Failed to save order!");
        return;
      }

      // Insert items
      const itemsPayload = cartItems.map((item) => ({
        order_id: orderMain.id,
        product_id: item.id,
        quantity: item.quantity || 1,
        price: item.price,
        total_price: item.price * (item.quantity || 1),
      }));

      const { error: itemsError } = await supabase
        .from("orders_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.log("Items Insert Error:", itemsError);
      }

      console.log("Order saved successfully:", orderMain.id);
    } catch (err) {
      console.log("Unexpected Error:", err);
    }
  };

  const completePayment = async () => {
    await saveOrderToSupabase();
    setShowPopup(true);

    setTimeout(() => {
      localStorage.removeItem("cart");
      window.location.href = "/";
    }, 2000);
  };

  return (
    <div className="checkout-container">
      <h2>Checkout Summary</h2>

      {cartItems.length === 0 ? (
        <p className="empty-msg">Your cart is empty. Add items to proceed.</p>
      ) : (
        <>
          <div className="summary-section">
            {cartItems.map((item) => (
              <div className="summary-item" key={item.id}>
                <img
                  src={item.image || item.image_url}
                  alt={item.name}
                  className="checkout-img"
                />
                <div>
                  <h3>{item.name}</h3>
                  <p>${item.price}</p>
                </div>
              </div>
            ))}
            <h3 className="total">Total: ${total.toFixed(2)}</h3>
          </div>

          <form className="payment-form" onSubmit={handlePayment}>
            <h3>Select Payment Method</h3>

            <div className="payment-image-options">
              <div
                className={`image-option ${
                  formData.paymentMethod === "EVC+" ? "selected" : ""
                }`}
                onClick={() => handleSelectMethod("EVC+")}
              >
                <img src={evcImg} alt="EVC Plus" />
                <p>EVC+</p>
              </div>

              <div
                className={`image-option ${
                  formData.paymentMethod === "SAHAL" ? "selected" : ""
                }`}
                onClick={() => handleSelectMethod("SAHAL")}
              >
                <img src={sahalImg} alt="Sahal" />
                <p>SAHAL</p>
              </div>

              <div
                className={`image-option ${
                  formData.paymentMethod === "Cash on Delivery"
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleSelectMethod("Cash on Delivery")}
              >
                <img src={cashImg} alt="Cash" />
                <p>Cash on Delivery</p>
              </div>
            </div>

            {["SAHAL", "EVC+"].includes(formData.paymentMethod) && (
              <div className="mobile-payment-section">
                <h4>{formData.paymentMethod} Payment</h4>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder={`Enter your ${formData.paymentMethod} number`}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {formData.paymentMethod === "Cash on Delivery" && (
              <div className="billing-info">
                <h4>Delivery Information</h4>

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="address"
                  placeholder="Delivery Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="confirm-btn">
              Confirm Payment 💳
            </button>
          </form>
        </>
      )}

      {/* PIN POPUP */}
      {showPinPrompt && (
        <div className="popup">
          <div className="popup-content sahal-style">
            <h4>&lt;{selectedOperator}&gt;</h4>
            <p>
              Ma hubtaa inaad ${total.toFixed(2)} ku bixiso? Fadlan geli PIN-kaaga.
            </p>

            <form onSubmit={handleSendPayment}>
              <input
                type="password"
                name="pin"
                placeholder="••••"
                maxLength={4}
                value={formData.pin}
                onChange={handleChange}
                required
              />

              <div className="popup-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowPinPrompt(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="ok-btn">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="checkmark">✅</span>
            <h3>Payment Successful!</h3>
            <p>
              Thank you for your purchase using{" "}
              {formData.paymentMethod === "Cash on Delivery"
                ? "Cash on Delivery"
                : `${formData.paymentMethod} (${formData.phoneNumber})`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
