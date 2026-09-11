// src/api/apiConfig.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const endpoints = {
  // Auth — HAS /api
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  me: `${API_BASE_URL}/api/auth/me`,
  forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
  resetPassword: `${API_BASE_URL}/api/auth/reset-password`,

  // Workspace — NO /api (this is the fix!)
  createWorkspace: `${API_BASE_URL}/workspaces`,
}

export default API_BASE_URL