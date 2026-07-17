import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem('bc-token');
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: !!token,
    });
  } else {
    // If socket exists but isn't connected, ensure it uses the latest token
    const token = localStorage.getItem('bc-token');
    if (token && !socketInstance.connected) {
      socketInstance.auth = { token };
      socketInstance.connect();
    }
  }

  return socketInstance;
};