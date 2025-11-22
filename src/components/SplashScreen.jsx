import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css"; 

export default function SplashScreen() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 3500);
    const navTimer = setTimeout(() => navigate("/home"), 4000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className={`splash ${fadeOut ? "fade-out" : ""}`}>
      {/* Center content */}
      <div className="splash-content">
        <div className="splash-card">
          <h1 className="main-title">HANAD SHOPPING CENTER</h1>
          <p className="tagline">Quality, Trust, Good Service</p>
          <div className="loader"></div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="splash-footer">
        <p className="powered-by">Powered By Hudi Tech</p>
      </div>
    </div>
  );
}
