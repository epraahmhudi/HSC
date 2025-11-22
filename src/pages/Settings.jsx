import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [saveStatus, setSaveStatus] = useState({ show: false, message: "", type: "" });

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Password Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    securityAlerts: true,
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    language: "en",
  });

  // General Settings
  const [general, setGeneral] = useState({
    currency: "USD",
    timezone: "UTC",
  });

  // Store Settings (Admin)
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Hanad Shopping Center",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    taxRate: "0",
    shippingCost: "0",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Load user data from database if available
        if (userData.id) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userData.id)
            .single();

          if (!error && data) {
            setProfileData({
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
            });
          }
        } else {
          // Use stored data
          setProfileData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
        }
      }

      // Load saved settings from localStorage
      const savedNotifications = localStorage.getItem("notificationSettings");
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }

      const savedAppearance = localStorage.getItem("appearanceSettings");
      if (savedAppearance) {
        setAppearance(JSON.parse(savedAppearance));
      }

      const savedGeneral = localStorage.getItem("generalSettings");
      if (savedGeneral) {
        setGeneral(JSON.parse(savedGeneral));
      }

      const savedStore = localStorage.getItem("storeSettings");
      if (savedStore) {
        setStoreSettings(JSON.parse(savedStore));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showSaveStatus = (message, type) => {
    setSaveStatus({ show: true, message, type });
    setTimeout(() => {
      setSaveStatus({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSaveProfile = async () => {
    try {
      if (user?.id) {
        const { error } = await supabase
          .from("users")
          .update({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            address: profileData.address,
          })
          .eq("id", user.id);

        if (error) throw error;

        // Update localStorage
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        // Update localStorage only
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      showSaveStatus("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showSaveStatus("Failed to update profile", "error");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSaveStatus("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showSaveStatus("Password must be at least 6 characters", "error");
      return;
    }

    try {
      if (user?.id) {
        // Verify current password
        const { data, error } = await supabase
          .from("users")
          .select("password")
          .eq("id", user.id)
          .single();

        if (error || data.password !== passwordData.currentPassword) {
          showSaveStatus("Current password is incorrect", "error");
          return;
        }

        // Update password
        const { error: updateError } = await supabase
          .from("users")
          .update({ password: passwordData.newPassword })
          .eq("id", user.id);

        if (updateError) throw updateError;
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showSaveStatus("Password changed successfully!", "success");
    } catch (error) {
      console.error("Error changing password:", error);
      showSaveStatus("Failed to change password", "error");
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(notifications));
    showSaveStatus("Notification settings saved!", "success");
  };

  const handleSaveSecurity = () => {
    localStorage.setItem("securitySettings", JSON.stringify(security));
    showSaveStatus("Security settings saved!", "success");
  };

  const handleSaveAppearance = () => {
    localStorage.setItem("appearanceSettings", JSON.stringify(appearance));
    showSaveStatus("Appearance settings saved!", "success");
  };

  const handleSaveGeneral = () => {
    localStorage.setItem("generalSettings", JSON.stringify(general));
    showSaveStatus("General settings saved!", "success");
  };

  const handleSaveStore = () => {
    localStorage.setItem("storeSettings", JSON.stringify(storeSettings));
    showSaveStatus("Store settings saved!", "success");
  };

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
        <div className="settings-header">
          <h1>⚙️ Settings</h1>
          <button
            className="back-button"
            onClick={() => navigate("/adminpanel")}
          >
            ← Back to Admin Panel
          </button>
        </div>

        <div className="settings-layout">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <button
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              👤 Profile
            </button>
            <button
              className={activeTab === "security" ? "active" : ""}
              onClick={() => setActiveTab("security")}
            >
              🔒 Security
            </button>
            <button
              className={activeTab === "notifications" ? "active" : ""}
              onClick={() => setActiveTab("notifications")}
            >
              🔔 Notifications
            </button>
            <button
              className={activeTab === "appearance" ? "active" : ""}
              onClick={() => setActiveTab("appearance")}
            >
              🎨 Appearance
            </button>
            <button
              className={activeTab === "general" ? "active" : ""}
              onClick={() => setActiveTab("general")}
            >
              ⚙️ General
            </button>
            {isAdmin && (
              <button
                className={activeTab === "store" ? "active" : ""}
                onClick={() => setActiveTab("store")}
              >
                🏪 Store Settings
              </button>
            )}
            <button
              className={activeTab === "privacy" ? "active" : ""}
              onClick={() => setActiveTab("privacy")}
            >
              🔐 Privacy
            </button>
          </div>

          {/* Main Content */}
          <div className="settings-content">
            {/* Save Status Message */}
            {saveStatus.show && (
              <div className={`save-status ${saveStatus.type}`}>
                {saveStatus.message}
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="settings-section">
                <h2>Profile Settings</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      placeholder="Enter your address"
                      rows="3"
                    />
                  </div>

                  <button className="save-button" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="settings-section">
                <h2>Security Settings</h2>
                <div className="settings-form">
                  <h3>Change Password</h3>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    className="save-button"
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </button>

                  <div className="divider"></div>

                  <h3>Security Options</h3>
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div>
                        <label>Two-Factor Authentication</label>
                        <p className="toggle-description">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={security.twoFactorAuth}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              twoFactorAuth: e.target.checked,
                            })
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div>
                        <label>Login Alerts</label>
                        <p className="toggle-description">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={security.loginAlerts}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              loginAlerts: e.target.checked,
                            })
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <button className="save-button" onClick={handleSaveSecurity}>
                    Save Security Settings
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="settings-section">
                <h2>Notification Settings</h2>
                <div className="settings-form">
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div>
                        <label>Email Notifications</label>
                        <p className="toggle-description">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              emailNotifications: e.target.checked,
                            })
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div>
                        <label>Order Updates</label>
                        <p className="toggle-description">
                          Get notified about your order status
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.orderUpdates}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              orderUpdates: e.target.checked,
                            })
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div>
                        <label>Promotions & Offers</label>
                        <p className="toggle-description">
                          Receive special offers and promotions
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.promotions}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              promotions: e.target.checked,
                            })
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div>
                        <label>Newsletter</label>
                        <p className="toggle-description">
                          Subscribe to our monthly newsletter
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.newsletter}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              newsletter: e.target.checked,
                            })
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div>
                        <label>Security Alerts</label>
                        <p className="toggle-description">
                          Important security notifications
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.securityAlerts}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              securityAlerts: e.target.checked,
                            })
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <button
                    className="save-button"
                    onClick={handleSaveNotifications}
                  >
                    Save Notification Settings
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="settings-section">
                <h2>Appearance Settings</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Theme</label>
                    <select
                      value={appearance.theme}
                      onChange={(e) =>
                        setAppearance({ ...appearance, theme: e.target.value })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={appearance.language}
                      onChange={(e) =>
                        setAppearance({
                          ...appearance,
                          language: e.target.value,
                        })
                      }
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>

                  <button
                    className="save-button"
                    onClick={handleSaveAppearance}
                  >
                    Save Appearance Settings
                  </button>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === "general" && (
              <div className="settings-section">
                <h2>General Settings</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={general.currency}
                      onChange={(e) =>
                        setGeneral({ ...general, currency: e.target.value })
                      }
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="SOS">SOS (Sh)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={general.timezone}
                      onChange={(e) =>
                        setGeneral({ ...general, timezone: e.target.value })
                      }
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Africa/Mogadishu">Mogadishu</option>
                    </select>
                  </div>

                  <button className="save-button" onClick={handleSaveGeneral}>
                    Save General Settings
                  </button>
                </div>
              </div>
            )}

            {/* Store Settings (Admin Only) */}
            {activeTab === "store" && isAdmin && (
              <div className="settings-section">
                <h2>Store Settings</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Store Name</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeName: e.target.value,
                        })
                      }
                      placeholder="Enter store name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Store Email</label>
                    <input
                      type="email"
                      value={storeSettings.storeEmail}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeEmail: e.target.value,
                        })
                      }
                      placeholder="Enter store email"
                    />
                  </div>

                  <div className="form-group">
                    <label>Store Phone</label>
                    <input
                      type="tel"
                      value={storeSettings.storePhone}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storePhone: e.target.value,
                        })
                      }
                      placeholder="Enter store phone"
                    />
                  </div>

                  <div className="form-group">
                    <label>Store Address</label>
                    <textarea
                      value={storeSettings.storeAddress}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeAddress: e.target.value,
                        })
                      }
                      placeholder="Enter store address"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax Rate (%)</label>
                    <input
                      type="number"
                      value={storeSettings.taxRate}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          taxRate: e.target.value,
                        })
                      }
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Default Shipping Cost ($)</label>
                    <input
                      type="number"
                      value={storeSettings.shippingCost}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          shippingCost: e.target.value,
                        })
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <button className="save-button" onClick={handleSaveStore}>
                    Save Store Settings
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="settings-section">
                <h2>Privacy Settings</h2>
                <div className="settings-form">
                  <div className="privacy-info">
                    <h3>Data Privacy</h3>
                    <p>
                      We respect your privacy and are committed to protecting
                      your personal data. Your information is securely stored
                      and only used to provide you with the best shopping
                      experience.
                    </p>
                  </div>

                  <div className="privacy-actions">
                    <button className="danger-button">
                      Download My Data
                    </button>
                    <button className="danger-button">
                      Delete My Account
                    </button>
                  </div>

                  <div className="privacy-info">
                    <h3>Cookie Preferences</h3>
                    <p>
                      We use cookies to enhance your browsing experience and
                      analyze site traffic. You can manage your cookie
                      preferences below.
                    </p>
                  </div>

                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div>
                        <label>Essential Cookies</label>
                        <p className="toggle-description">
                          Required for the website to function properly
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked disabled />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div>
                        <label>Analytics Cookies</label>
                        <p className="toggle-description">
                          Help us understand how visitors interact with our site
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div>
                        <label>Marketing Cookies</label>
                        <p className="toggle-description">
                          Used to deliver personalized advertisements
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

