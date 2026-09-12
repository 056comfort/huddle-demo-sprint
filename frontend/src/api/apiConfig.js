// src/api/apiConfig.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const endpoints = {
  // Auth
  register:       `${API_BASE_URL}/api/auth/register`,
  login:          `${API_BASE_URL}/api/auth/login`,
  me:             `${API_BASE_URL}/api/auth/me`,
  forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
  resetPassword:  `${API_BASE_URL}/api/auth/reset-password`,

  // Users
  users:          `${API_BASE_URL}/api/users`,
  userById:       (id) => `${API_BASE_URL}/api/users/${id}`,

  // Channels
  channels:           `${API_BASE_URL}/api/channels`,
  channelById:        (id)   => `${API_BASE_URL}/api/channels/${id}`,
  channelByName:      (name) => `${API_BASE_URL}/api/channels/by-name/${encodeURIComponent(name)}`,
  channelMessages:    (id)   => `${API_BASE_URL}/api/channels/${id}/messages`,
  joinChannel:        (id)   => `${API_BASE_URL}/api/channels/${id}/members`,
  addChannelMember:   (id)   => `${API_BASE_URL}/api/channels/${id}/members/add`,
  leaveChannel:       (id)   => `${API_BASE_URL}/api/channels/${id}/members/me`,

  // Direct Messages (conversations)
  conversations:  `${API_BASE_URL}/api/dms`,
  dmMessages:     (convId) => `${API_BASE_URL}/api/dms/${convId}/messages`,

  // Workspace
  createWorkspace: `${API_BASE_URL}/workspaces`,
}

/**
 * Authenticated fetch helper — automatically adds the JWT Authorization header.
 * Usage: apiFetch(endpoints.channels)
 *        apiFetch(endpoints.channelMessages(id), { method:'POST', body: JSON.stringify({content}) })
 */
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }
  return fetch(url, { ...options, headers })
}

export default API_BASE_URL