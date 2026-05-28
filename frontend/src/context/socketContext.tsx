"use client";

import React, { createContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { RealTime_service, useAppData } from "./AppContext"; 

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  // Grab the logged-in user from your AppContext
  const { user } = useAppData(); 

  useEffect(() => {
    // Use the real user ID 
    const currentUserId = user?.user_id?.toString(); 
    
    // 🚀 THE FIX: If the user logs out (currentUserId is null/undefined), 
    // completely wipe the socket and state to trigger offline status globally.
    if (!currentUserId) {
      setSocket((prevSocket) => {
        if (prevSocket) {
          prevSocket.disconnect();
        }
        return null;
      });
      setIsConnected(false);
      setOnlineUsers([]);
      return;
    }

    // Initialize the socket
    const socketInstance = io(RealTime_service, {
      query: { userId: currentUserId },
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socketInstance.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]); // Runs exactly when the 'user' logs in or logs out

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};