import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar"; // ✅ Ku dar Navbar
import "./ProductManagement.css";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", price: "", imageFile: null });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, product: null });

  // ✅ Fetch all products
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) console.error("❌ Fetch error:", error);
    else setProducts(data);
  };

  useEffect(() => {
    fetchProducts();

    // ✅ Realtime updates
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("📡 Realtime change detected:", payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Helper: Show popup
  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
  };

  // ✅ Handle file upload
  const handleImageUpload = (e) => {
    setForm({ ...form, imageFile: e.target.files[0] });
  };

  // ✅ Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return showPopup("⚠️ Fadlan buuxi magac & qiime!", "error");

    setLoading(true);
    try {
      let image_url = null;

      if (form.imageFile) {
        const fileExt = form.imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, form.imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        image_url = publicUrlData?.publicUrl;
      }

      if (isEditing) {
        const updates = { name: form.name, price: parseFloat(form.price) };
        if (image_url) updates.image_url = image_url;

        const { error } = await supabase.from("products").update(updates).eq("id", form.id);
        if (error) throw error;

        showPopup("✅ Product updated successfully!");
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([{ name: form.name, price: parseFloat(form.price), image_url }])
          .select();

        if (error) throw error;
        if (data && data.length > 0) setProducts((prev) => [data[0], ...prev]);

        showPopup("✅ Product added successfully!");
      }

      setForm({ id: null, name: "", price: "", imageFile: null });
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error saving product:", err.message);
      showPopup(`❌ Error: ${err.message}`, "error");
    }

    setLoading(false);
  };

  // ✅ Confirm delete
  const handleDeleteConfirm = async () => {
    if (!confirmDelete.product) return;
    const { id, name } = confirmDelete.product;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      showPopup("❌ Error deleting product!", "error");
    } else {
      showPopup(`🗑️ Deleted "${name}" successfully!`);
    }

    setConfirmDelete({ show: false, product: null });
  };

  const editProduct = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: product.price,
      imageFile: null,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* ✅ Navbar (kaliya Logout, Home, AdminPanel, About) */}
      <Navbar hideLogin={true} />

      <div className="product-management">
        <h1>🛠️ Product Management</h1>

        {/* ✅ Product Form */}
        <form className="product-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
            </button>

            {isEditing && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setForm({ id: null, name: "", price: "", imageFile: null });
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ✅ Product Grid */}
        <div className="product-grid">
          {products.length === 0 && <p>❗ No products found.</p>}
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={product.image_url || "https://via.placeholder.com/150"}
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>

              <div className="admin-btns">
                <button className="edit-btn" onClick={() => editProduct(product)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setConfirmDelete({ show: true, product })}
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Popup Toast */}
        {popup.show && (
          <div className={`popup-message ${popup.type}`}>{popup.message}</div>
        )}

        {/* ✅ Delete Confirmation Modal */}
        {confirmDelete.show && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>⚠️ Ma hubtaa inaad tirtirto "{confirmDelete.product.name}"?</h3>
              <div className="modal-buttons">
                <button className="delete-btn" onClick={handleDeleteConfirm}>
                  Haa, Delete
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setConfirmDelete({ show: false, product: null })}
                >
                  Maya, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
