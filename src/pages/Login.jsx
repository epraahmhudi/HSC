import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Soo qab redirect-ka URL query (tusaale /login?redirect=/products/5)
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/home";

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 2500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error || !data) {
        showPopup("❌ Incorrect email or password!", "error");
        return;
      }

      // ✅ Kaydi user-ka si uu ProtectedRoute u arko
      localStorage.setItem("user", JSON.stringify(data));

      showPopup(`✅ Welcome back, ${data.name}!`, "success");

      // ✅ Marka uu login guuleysto — ku celi halka uu rabay (tusaale /products/5)
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1200);
    } catch (err) {
      console.error("Login error:", err);
      showPopup("❌ Something went wrong!", "error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back 👋</h2>
        <p className="subtitle">Login to continue shopping</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="small-btn">
            Login
          </button>
        </form>

        <p className="switch-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="link">
            Sign up
          </Link>
        </p>
      </div>

      {popup && <div className={`popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
}
