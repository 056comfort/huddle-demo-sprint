// Handles authentication state for the frontend.
// The login flow already stores the backend JWT in localStorage as "token".

export function useAuth() {
  const token = localStorage.getItem("token");

  return {
    user: null,
    token,

    login: (data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
    },

    register: (data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
    },

    logout: () => {
      localStorage.removeItem("token");
    },
  };
}