import React, { createContext, useContext, useState, useEffect } from "react";
import api, { getErrorMessage } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("erp_user");
    const token = localStorage.getItem("erp_token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("erp_user");
        localStorage.removeItem("erp_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("erp_token", data.token);
      localStorage.setItem("erp_user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const logout = () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
