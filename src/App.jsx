import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import ProductManagement from "./pages/ProductManagement";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Inventory from "./pages/Inventory"; // ✅ Added Inventory page
import Analytics from "./pages/Analytics"; // ✅ Added Analytics page
import Settings from "./pages/Settings"; // ✅ Added Settings page
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute"; // Keep it, used in other routes

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Splash Screen */}
        <Route path="/" element={<SplashScreen />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Admin Pages */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="/ProductManagement" element={<ProductManagement />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/inventory" element={<Inventory />} /> {/* ✅ NEW */}
        <Route path="/analytics" element={<Analytics />} /> {/* ✅ Analytics */}
        <Route path="/settings" element={<Settings />} /> {/* ✅ Settings */}

        {/* Home Page */}
        <Route
          path="/home"
          element={
            <>
              <Navbar />
              <div style={{ padding: "20px" }}>
                <Home />
              </div>
            </>
          }
        />

        {/* Products */}
        <Route
          path="/products"
          element={
            <>
              <Navbar />
              <div style={{ padding: "20px" }}>
                <Products />
              </div>
            </>
          }
        />

        {/* Product Details - ✅ Protected */}
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div style={{ padding: "20px" }}>
                  <ProductDetails />
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* About */}
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <div style={{ padding: "20px" }}>
                <About />
              </div>
            </>
          }
        />

        {/* Cart - ✅ Protected */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div style={{ padding: "20px" }}>
                  <Cart />
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* Checkout - ✅ Protected */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div style={{ padding: "20px" }}>
                  <Checkout />
                </div>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
