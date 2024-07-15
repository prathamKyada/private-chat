// import { useEffect } from 'react';
import io from 'socket.io-client'
let socket;

export const initSocket = () => {
  if (typeof window !== 'undefined') {
    socket = io('http://localhost:8082');
  }

  return socket;
};

export const sendMessage = (room, message) => {
  // console.log("Room >", room);
  console.log("Message >", message);
  socket.emit('message', { room, message });
};

export const listenForMessages = (callback) => {
  console.log("Call back > ", callback);
  socket.on('message', callback);
};
