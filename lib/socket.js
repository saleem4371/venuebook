import { io } from "socket.io-client";

let socket = null;
let heartbeatInterval = null;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket"],
      query: { userId },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      heartbeatInterval = setInterval(() => {
         console.log("Socket running:");
        socket.emit("heartbeat", { userId });
      }, 30000);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

export const getSocket = () => socket;