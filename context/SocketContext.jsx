"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { connectSocket } from "@/lib/socket"; 

const SocketContext = createContext({
  socket: null,
  status: null,
});

export const SocketProvider = ({ userId, children }) => {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const s = connectSocket(String(userId));

    setSocket(s);

    const onConnect = () => {
      setStatus({
        type: "connected",
        message: "Live updates connected",
      });
    };

    const onDisconnect = () => {
      setStatus({
        type: "disconnected",
        message: "Connection lost. Reconnecting...",
      });
    };

    const onRealtimeStatus = (data) => {
      console.log("Realtime:", data);
      setStatus(data);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("realtime-status", onRealtimeStatus);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("realtime-status", onRealtimeStatus);
    };
  }, [userId]);

  useEffect(() => {
  console.log("Provider Status Changed:", status);
}, [status]);

  return (
    <SocketContext.Provider value={{ socket, status }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

