// src/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Marka hore waa true

  // Marka app-ku load-gareeyo, hubi haddii user horey u jiray
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // marka la hubiyo user, loading waa dhamaaday
  }, []);

  const login = async (email) => {
    setLoading(true);
    try {
      const userData = { email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email) => {
    setLoading(true);
    try {
      const userData = { email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Inta uu loading yahay, ha renderin children-ka si aan u helno UX fiican
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook-ka si aad u isticmaasho Auth-ka meel kasta
export const useAuth = () => useContext(AuthContext);
