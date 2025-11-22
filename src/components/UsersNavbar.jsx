import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css"; 
import logo from "../assets/7.png";

export default function UsersNavbar({ onAddUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* Left Side Logo */}
        <div className="nav-left">
          <img src={logo} alt="Logo" className="nav-logo-img" />
          <h1 className="nav-logo-text">Hanad Shopping Center</h1>
        </div>

        {/* Right Side Links */}
        <div className="nav-links">

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

          {/* ⭐ THIS replaces About → Add User */}
          <button className="nav-btn" onClick={onAddUser}>
            Add User
          </button>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
