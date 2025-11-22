import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabaseClient";
import "./Products.css";

export default function Products() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch all products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("❌ Error fetching products:", error.message);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();

    // ✅ Real-time auto update when new product added
    const subscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("🔄 Products updated:", payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // ✅ Handle Buy Button
  const handleBuy = (id) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(`/products/${id}`);
    }
  };

  // ✅ Filter products by search term
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-container">
      <h2 className="products-title">🛍️ Our Products</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div className="product-card" key={p.id}>
              <img
                src={p.image_url}
                alt={p.name}
                className="product-image"
                onError={(e) => (e.target.src = "/fallback.png")}
              />
              <h3 className="product-name">{p.name}</h3>
              <p className="product-price">${p.price}</p>
              <button className="buy-button" onClick={() => handleBuy(p.id)}>
                Buy Now
              </button>
            </div>
          ))
        ) : (
          <p className="no-products">No products found.</p>
        )}
      </div>
    </div>
  );
}
