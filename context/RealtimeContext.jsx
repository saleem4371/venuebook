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
});

export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const socket = connectSocket(String(user.id));

    const onConnect = () => {
      console.log("Socket Connected:", socket.id);
    };

    const onDisconnect = () => {
      console.log("Socket Disconnected");
    };

    const onRealtime = (data) => {
      console.log("Realtime Event:", data);

      setRefreshKey((prev) => prev + 1);
    };

    const onAny = (event, ...args) => {
      console.log("Socket Event:", event, args);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("realtime-status", onRealtime);
    socket.onAny(onAny);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("realtime-status", onRealtime);
      socket.offAny(onAny);
    };
  }, [user?.id]);

  const value = useMemo(
    () => ({
      refreshKey,
    }),
    [refreshKey]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);