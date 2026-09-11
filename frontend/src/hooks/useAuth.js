// Handles authentication state for the frontend.
import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("huddle_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (data) => {
    const tokenVal = data?.token || "demo-jwt-token-" + Date.now();
    const userVal = data?.user || {
      id: data?.id || Date.now(),
      name: data?.name || data?.fullName || (data?.email ? data.email.split('@')[0] : "User"),
      email: data?.email || "name@gmail.com",
    };

    localStorage.setItem("token", tokenVal);
    localStorage.setItem("huddle_user", JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
    return { token: tokenVal, user: userVal };
  };

  const register = (data) => {
    return login(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("huddle_user");
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    login,
    register,
    logout,
  };
}