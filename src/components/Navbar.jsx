import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../assets/7.png";

export default function Navbar({ onAddUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    setUser(null);
    setAdmin(null);
    navigate("/", { replace: true });
  };

  // ✅ Go'aami haddii aan ku jirno ProductManagement, Orders, or Users page
  const isProductManagement =
    location.pathname.toLowerCase() === "/productmanagement";
  const isOrders = location.pathname.toLowerCase() === "/orders";
  const isUsers = location.pathname.toLowerCase() === "/users";
  const showAdminNav = isProductManagement || isOrders;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <img src={logo} alt="Logo" className="nav-logo-img" />
          <h1 className="nav-logo-text">Hanad Shopping Center</h1>
        </div>

        <div className="nav-links">
          {/* ✅ Haddii aan joogno Users page, muuji buttons gaar ah */}
          {isUsers ? (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>

              <NavLink
                to="/adminpanel"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Admin Panel
              </NavLink>

              <button onClick={onAddUser} className="nav-link-button">
                ➕ Add User
              </button>

              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : showAdminNav ? (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>

              <NavLink
                to="/adminpanel"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Admin Panel
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                About
              </NavLink>

              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* ✅ Navbar caadi ah markaanan ku jirin ProductManagement */}
              <NavLink
                to="/home"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Products
              </NavLink>

              <NavLink
                to="/cart"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cart
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                About
              </NavLink>

              {admin && (
                <NavLink
                  to="/adminpanel"
                  className={({ isActive }) =>
                    isActive ? "active admin-btn" : "admin-btn"
                  }
                >
                  Admin Panel
                </NavLink>
              )}

              {(user || admin) ? (
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/adminlogin")}
                  className="login-btn"
                >
                  Login
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
