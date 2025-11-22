import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // UPDATED: password added
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "customer",
    password: "", // NEW
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (!error) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ADD USER — UPDATED WITH PASSWORD
  const addUser = async () => {
    const { error } = await supabase.from("users").insert([
      {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password, // NEW
        is_banned: false,
      },
    ]);

    if (!error) {
      fetchUsers();
      setShowAdd(false);
    }
  };

  const editUser = async () => {
    const { error } = await supabase
      .from("users")
      .update({
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })
      .eq("id", selectedUser.id);

    if (!error) {
      fetchUsers();
      setShowEdit(false);
    }
  };

  const deleteUser = async () => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", selectedUser.id);

    if (!error) {
      fetchUsers();
      setShowDelete(false);
    }
  };

  const confirmBan = async () => {
    const { error } = await supabase
      .from("users")
      .update({ is_banned: !selectedUser.is_banned })
      .eq("id", selectedUser.id);

    if (!error) {
      fetchUsers();
      setShowBan(false);
    }
  };

  const openDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  return (
    <>
      {/* ✅ Navbar with Home, Admin Panel, Add User, Logout buttons */}
      <Navbar onAddUser={() => setShowAdd(true)} />

      <div className="users-container">
        {/* Page Header - Only title now, buttons moved to navbar */}
        <div className="page-header">
          <h2>👥 Users Management</h2>
        </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="card-table">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>

                  <td>
                    {u.is_banned ? (
                      <span className="badge banned">🚫 Banned</span>
                    ) : (
                      <span className="badge active">✔ Active</span>
                    )}
                  </td>

                  <td className="actions">
                    <button className="btn-info" onClick={() => openDetails(u)}>
                      ℹ Details
                    </button>

                    <button
                      className="btn-edit"
                      onClick={() => {
                        setSelectedUser(u);
                        setFormData({
                          name: u.name,
                          email: u.email,
                          role: u.role,
                          password: "", // password lama edit gareeyo
                        });
                        setShowEdit(true);
                      }}
                    >
                      ✏ Edit
                    </button>

                    <button
                      className="btn-ban"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowBan(true);
                      }}
                    >
                      {u.is_banned ? "Unban" : "Ban"}
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowDelete(true);
                      }}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && (
        <div className="modal-overlay">
          <div className="modal details-modal">
            <h3>User Details</h3>

            <div className="details-grid">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedUser.is_banned ? "🚫 Banned" : "✔ Active"}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {selectedUser.created_at
                  ? new Date(selectedUser.created_at).toLocaleString()
                  : "Not available"}
              </p>
            </div>

            <button className="btn-main" onClick={() => setShowDetails(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* BAN MODAL */}
      {showBan && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{selectedUser.is_banned ? "Unban User" : "Ban User"}</h3>

            <p>
              Ma hubtaa inaad{" "}
              <strong>{selectedUser.is_banned ? "UNBAN" : "BAN"} {selectedUser.name}</strong>?
            </p>

            <button onClick={confirmBan} className="btn-main">
              Haa, Continue
            </button>

            <button onClick={() => setShowBan(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ADD USER — WITH PASSWORD */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add User</h3>

            <input name="name" placeholder="Full name" onChange={handleChange} />

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />

            <select name="role" onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>

            <button className="btn-main" onClick={addUser}>
              Save
            </button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EDIT USER */}
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User</h3>

            <input name="name" value={formData.name} onChange={handleChange} />
            <input name="email" value={formData.email} onChange={handleChange} />

            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>

            <button className="btn-main" onClick={editUser}>
              Update
            </button>

            <button className="btn-secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DELETE USER */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h3>Delete User?</h3>
            <p>Once deleted, this user cannot be recovered.</p>

            <button className="btn-danger" onClick={deleteUser}>
              Yes, Delete
            </button>

            <button className="btn-secondary" onClick={() => setShowDelete(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
