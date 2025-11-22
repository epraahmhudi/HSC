import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const adminEmail = "epraahmhudi@gmail.com";
    const adminPassword = "123456";

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem("isAdmin", "true");
      setPopup({ show: true, message: "Welcome Admin!", type: "success" });
      setIsSuccess(true);
    } else {
      setPopup({
        show: true,
        message: "Invalid email or password!",
        type: "error",
      });
    }

    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
    }, 2000);
  };

  // ✅ navigate gudaha useEffect
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/adminpanel");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Admin Login</h2>
        <p className="subtitle">Access the admin panel securely</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <div className="switch-text">
          <span>
            Go back to{" "}
            <a className="link" onClick={() => navigate("/login")}>
              User Login
            </a>
          </span>
        </div>
      </div>

      {popup.show && (
        <div className={`popup ${popup.type}`}>{popup.message}</div>
      )}
    </div>
  );
}
