import React, { createContext, useContext, useState, useEffect } from "react";

// 1️⃣ Create the context
const AuthContext = createContext();

// 2️⃣ Provider which your _app.js wraps around everything
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On first load, see if we already have a logged‐in user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // 3️⃣ Register against your own /api/auth/register
  const registerUser = async ({ email, password }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }
    const { user: u } = await res.json();
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  // 4️⃣ Login against your own /api/auth/login
  const loginUser = async ({ email, password }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const { user: u } = await res.json();
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, registerUser, loginUser, logout, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 5️⃣ Helper hook
export function useAuth() {
  return useContext(AuthContext);
}
