import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

export default function AdminPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/adminlogin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/adminlogin");
  };

  return (
    <div className="admin-dashboard">
      {/* ===== Sidebar ===== */}
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li onClick={() => navigate("/ProductManagement")}>
            🛒 Product Management
          </li>
          <li onClick={() => navigate("/orders")}>📦 Orders</li>
          <li onClick={() => navigate("/users")}>👥 Users</li>
          <li onClick={() => navigate("/inventory")}>📊 Inventory</li>
          <li onClick={() => navigate("/analytics")}>📈 Analytics</li>
          <li onClick={() => navigate("/settings")}>⚙️ Settings</li>

          <li className="logout" onClick={handleLogout}>
            🚪 Logout
          </li>
        </ul>
      </div>

      {/* ===== Main Content ===== */}
      <div className="admin-content">
        <h1>Welcome, Admin 👋</h1>
        <p>Manage your store from here — choose a section on the left.</p>

        <div className="admin-cards">
          <div
            className="admin-card"
            onClick={() => navigate("/ProductManagement")}
          >
            <h3>🛒 Product Management</h3>
            <p>View, add, or edit your store products.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/orders")}>
            <h3>📦 Orders</h3>
            <p>View and manage all customer orders.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/users")}>
            <h3>👥 Users</h3>
            <p>Manage registered users and roles.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/inventory")}>
            <h3>📊 Inventory</h3>
            <p>Track stock levels and restock alerts.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/analytics")}>
            <h3>📈 Analytics</h3>
            <p>View sales trends and performance insights.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/settings")}>
            <h3>⚙️ Settings</h3>
            <p>Manage store preferences and configurations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
