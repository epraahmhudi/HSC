import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // 🔄 Fetch product from Supabase by ID
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProduct(data);
      else console.error("❌ Product fetch error:", error.message);
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="not-found fade-in">
        <h2>⚠️ Product Not Found</h2>
        <button onClick={() => navigate(-1)} className="back-to-products">
          Go Back
        </button>
      </div>
    );
  }

  // 🛒 Add to cart system
  const handleBuyNow = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
      navigate("/cart");
    }, 1500);
  };

  return (
    <div className="details-wrapper fade-in">
      <div className="details-box">
        {/* LEFT: IMAGE */}
        <div className="details-left">
          <img
            src={product.image_url}
            alt={product.name}
            className="details-img"
          />
        </div>

        {/* RIGHT: INFORMATION */}
        <div className="details-right">
          <h1 className="details-title">{product.name}</h1>

          <p className="details-description">{product.description}</p>

          <p className="details-price">${product.price}</p>

          <div className="details-buttons">
            <button className="btn-back" onClick={() => navigate(-1)}>
              ◀ Back
            </button>

            <button className="btn-buy" onClick={handleBuyNow}>
              Buy Now 💳
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-check">✅</div>
            <p>Item added to cart!</p>
          </div>
        </div>
      )}
    </div>
  );
}
