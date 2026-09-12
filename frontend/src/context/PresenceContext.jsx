import { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../api/socket';

const PresenceContext = createContext({
  onlineUsers: {}, // { [userId]: boolean }
});

export const usePresence = () => useContext(PresenceContext);

export const PresenceProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    // Listen for presence events
    const handleUserOnline = ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    };

    // Assuming the backend sends an initial list of online users on connect
    const handleInitialPresence = ({ onlineUsers: initialUsers }) => {
      const usersMap = {};
      initialUsers.forEach(id => {
        usersMap[id] = true;
      });
      setOnlineUsers(prev => ({ ...prev, ...usersMap }));
    };

    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('presence:initial', handleInitialPresence);

    // Request initial presence if socket is already connected
    if (socket.connected) {
      socket.emit('presence:request');
    } else {
      socket.on('connect', () => {
        socket.emit('presence:request');
      });
    }

    return () => {
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('presence:initial', handleInitialPresence);
      socket.off('connect');
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};
