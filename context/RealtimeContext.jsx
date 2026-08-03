"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

const RealtimeContext = createContext({
  refreshKey: 0,
  realtime: null,
  socket: null,
});

export function RealtimeProvider({ children }) {
  const { user } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [realtime, setRealtime] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const socket = connectSocket(String(user.id));
    setSocketInstance(socket);

    const onConnect = () => {
      console.log("✅ Socket Connected:", socket.id);
    };

    const onDisconnect = () => {
      console.log("❌ Socket Disconnected");
    };

    const handleEvent = (type) => (data) => {
      console.log(`${type}:`, data);

      setRealtime({
        type,
        ...data,
      });

      setRefreshKey((prev) => prev + 1);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // User Events
    socket.on("realtime-status", handleEvent("realtime"));
    socket.on("booking-status", handleEvent("booking"));
    socket.on("notification-status", handleEvent("notification"));

    // Global Events
    socket.on("announcement-status", handleEvent("announcement"));

    socket.onAny((event, ...args) => {
      console.log("Socket Event:", event, args);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);

      socket.off("realtime-status");
      socket.off("booking-status");
      socket.off("notification-status");
      socket.off("announcement-status");

      socket.disconnect();
    };
  }, [user?.id]);

  const value = useMemo(
    () => ({
      refreshKey,
      realtime,
      socket: socketInstance,
    }),
    [refreshKey, realtime, socketInstance]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);