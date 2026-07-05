import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, token]);

  const emitLocation = (lat, lng) => {
    socketRef.current?.emit("locationUpdate", { lat, lng });
  };

  const joinOrderRoom = (orderId) => {
    socketRef.current?.emit("joinOrderRoom", { orderId });
  };

  const onDriverLocation = (callback) => {
    socketRef.current?.on("driverLocation", callback);
    return () => socketRef.current?.off("driverLocation", callback);
  };

  const onOrderStatus = (callback) => {
    socketRef.current?.on("orderStatus", callback);
    return () => socketRef.current?.off("orderStatus", callback);
  };

  const emit = (event, data) => socketRef.current?.emit(event, data);

  const on = (event, callback) => {
    socketRef.current?.on(event, callback);
    return () => socketRef.current?.off(event, callback);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        emit,
        on,
        emitLocation,
        joinOrderRoom,
        onDriverLocation,
        onOrderStatus,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
};