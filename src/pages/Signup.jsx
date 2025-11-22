import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import emailjs from "emailjs-com";
import "./Auth.css";

export default function Signup() {
  const [name, setName] = useState(""); // ✅ cusub
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [popup, setPopup] = useState(null);
  const [step, setStep] = useState(1);
  const [generatedCode, setGeneratedCode] = useState("");
  const [userCode, setUserCode] = useState("");
  const navigate = useNavigate();

  // EmailJS configs
  const SERVICE_ID = "service_ueib96f";
  const TEMPLATE_ID = "template_tprgenl";
  const PUBLIC_KEY = "LmchdZ2tJ_RL205As";

  // ✅ initialize EmailJS
  useEffect(() => {
    emailjs.init(PUBLIC_KEY);
  }, []);

  // Popup helper
  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 2500);
  };

  // Step 1: Send verification code
  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return showPopup("❌ Passwords do not match!", "error");
    }

    // Generate random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);

    // ✅ Add all template parameters
    const templateParams = {
      name: name, // Magaca uu userku geliyay
      user_email: email,
      verification_code: code,
      message: "Welcome to Hanad Shopping Center!",
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      showPopup("📧 Verification code sent to your email", "success");
      setStep(2);
    } catch (error) {
      console.error("Email error:", error);
      showPopup("❌ Failed to send verification email", "error");
    }
  };

  // Step 2: Verify code & save user data
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (userCode !== generatedCode) {
      return showPopup("❌ Incorrect code!", "error");
    }

    try {
      const { error } = await supabase
        .from("users")
        .insert([{ name, email, password }]); // ✅ magaca waa la kaydiyaa

      if (error) throw error;

      showPopup("🎉 Account created successfully!", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Database insert error:", err);
      showPopup("❌ Failed to create account!", "error");
    }
  };

  return (
    <div className="auth-page">
      {step === 1 && (
        <div className="auth-card">
          <h2>Create Account ✨</h2>
          <p className="subtitle">Join Hanad Shopping Center today</p>

          <form onSubmit={handleSignup}>
            {/* ✅ New Name Field */}
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit" className="small-btn">
              Sign Up
            </button>
          </form>

          <p className="switch-text">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Login
            </Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="auth-card">
          <h2>Verify Your Email 📩</h2>
          <p className="subtitle">Enter the 4-digit code sent to your email</p>

          <form onSubmit={handleVerifyCode}>
            <input
              type="text"
              maxLength="4"
              placeholder="Enter 4-digit code"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              required
              style={{
                textAlign: "center",
                letterSpacing: "5px",
                fontSize: "18px",
              }}
            />
            <button type="submit" className="small-btn">
              Verify
            </button>
          </form>

          <p className="switch-text">
            Didn’t receive code?{" "}
            <span
              className="link"
              onClick={() => handleSignup({ preventDefault: () => {} })}
            >
              Resend
            </span>
          </p>
        </div>
      )}

      {popup && <div className={`popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
}
