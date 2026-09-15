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

  /**
   * Call ONLY after a successful backend response that includes a real JWT.
   * data = { token: string, user: { id, name, email } }
   * Throws if no token is provided — prevents accidental session creation.
   */
  const login = (data) => {
    if (!data?.token) {
      throw new Error("auth.login() requires a real JWT token from the backend.");
    }
    const userVal = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("huddle_user", JSON.stringify(userVal));
    setToken(data.token);
    setUser(userVal);
    return { token: data.token, user: userVal };
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