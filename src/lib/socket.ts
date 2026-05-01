import { io } from 'socket.io-client';

export const socket = io({
  autoConnect: false
});

// For admin use only
export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
