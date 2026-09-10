// src/api/apiConfig.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const endpoints = {
  // Auth
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  me: `${API_BASE_URL}/api/auth/me`,

  // Workspace
  createWorkspace: `${API_BASE_URL}/api/workspaces`,
}

export default API_BASE_URL