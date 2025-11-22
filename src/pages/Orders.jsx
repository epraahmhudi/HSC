import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // ===============================================================
  //  FETCH ORDERS + USERS + ITEMS
  // ===============================================================
  useEffect(() => {
    const fetchOrders = async () => {

      // 1️⃣ GET ORDERS
      const { data: mainOrders, error: mainError } = await supabase
        .from("orders_main")
        .select("*")
        .order("created_at", { ascending: false });

      if (mainError) {
        console.error("❌ Error fetching orders_main:", mainError.message);
        return;
      }

      // 2️⃣ GET ITEMS + PRODUCT NAME
      const { data: items, error: itemsError } = await supabase
        .from("orders_items")
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          total_price,
          products(name)
        `);

      if (itemsError) {
        console.error("❌ Error fetching items:", itemsError.message);
        return;
      }

      // 3️⃣ GET USERS (YOUR TABLE)
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, email");

      if (usersError) {
        console.error("❌ Error fetching users:", usersError.message);
        return;
      }

      // 4️⃣ COMBINE ALL DATA
      const combined = mainOrders.map((order) => {
        const user = users.find((u) => u.id === order.user_id);

        return {
          ...order,
          customer_name: user?.name || "Unknown",
          customer_email: user?.email || "Unknown",
          items: items.filter((i) => i.order_id === order.id),
        };
      });

      setOrders(combined);
      setFilteredOrders(combined);
    };

    fetchOrders();
  }, []);

  // ===============================================================
  //  SEARCH + FILTER
  // ===============================================================
  useEffect(() => {
    let filtered = orders;

    if (filterStatus !== "All") {
      filtered = filtered.filter(
        (o) => o.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((o) => {
        const customer = o.customer_name?.toLowerCase() || "";
        const email = o.customer_email?.toLowerCase() || "";
        const status = o.status?.toLowerCase() || "";

        const productNames = o.items
          .map((item) => item.products?.name?.toLowerCase())
          .join(" ");

        return (
          customer.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          status.includes(searchTerm.toLowerCase()) ||
          productNames.includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, filterStatus, orders]);

  // ===============================================================
  //  UI TABLE
  // ===============================================================
  return (
    <>
      {/* ✅ Navbar with Home, Admin Panel, About, Logout buttons */}
      <Navbar />

      <div className="orders-container">
      <h2>📦 Orders Management</h2>

      <div className="orders-controls">
        <input
          type="text"
          placeholder="Search by customer or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>

                <td>
                  {order.customer_name}
                  <br />
                  <small>{order.customer_email}</small>
                </td>

                <td>
                  {order.items.map((item) => (
                    <div key={item.id}>
                      • {item.products?.name} (x{item.quantity})
                    </div>
                  ))}
                </td>

                <td>${order.total_price}</td>

                <td className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </td>

                <td>
                  {new Date(order.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-orders">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
}
