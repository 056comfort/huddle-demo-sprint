// src/api/socket.js
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://huddle-demo-sprint.onrender.com'

export const socket = io(SOCKET_URL, {
  autoConnect: false,  // Don't connect until user logs in
  transports: ['websocket'],
})

export default socket