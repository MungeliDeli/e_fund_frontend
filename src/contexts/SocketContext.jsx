/**
 * Socket.IO Context
 * Manages real-time communication with the backend
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { jwtDecode } from "jwt-decode";
import logger from "../utils/logger";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated, token, refreshAccessToken } = useAuth();
  const tokenCheckInterval = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io("http://localhost:3000", {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      logger.info("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      logger.info("Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", async (error) => {
      logger.error("Socket connection error:", error);
      setIsConnected(false);

      // If the error is due to JWT expiration, try to refresh the token
      if (error.message && error.message.includes("jwt expired")) {
        try {
          logger.info("JWT expired, attempting to refresh token...");
          const newToken = await refreshAccessToken();

          // Reconnect with the new token
          newSocket.auth.token = newToken;
          newSocket.connect();
        } catch (refreshError) {
          logger.error("Failed to refresh token:", refreshError);
          // Token refresh failed, user will be logged out by AuthContext
        }
      } else if (error.message && error.message.includes("Invalid token")) {
        // Handle invalid token case
        try {
          logger.info("Invalid token, attempting to refresh...");
          const newToken = await refreshAccessToken();
          newSocket.auth.token = newToken;
          newSocket.connect();
        } catch (refreshError) {
          logger.error("Failed to refresh invalid token:", refreshError);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token, refreshAccessToken]);

  // Token expiration check
  const checkTokenExpiration = useCallback(async () => {
    if (!token || !socket) return;

    try {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiry < 5 * 60 * 1000) {
        logger.info("Token expires soon, refreshing...");
        const newToken = await refreshAccessToken();

        // Update socket auth with new token
        if (socket && socket.auth) {
          socket.auth.token = newToken;
        }
      }
    } catch (error) {
      logger.error("Error checking token expiration:", error);
    }
  }, [token, socket, refreshAccessToken]);

  // Set up periodic token expiration check
  useEffect(() => {
    if (isAuthenticated && token && socket) {
      // Check immediately
      checkTokenExpiration();

      // Then check every 2 minutes
      tokenCheckInterval.current = setInterval(
        checkTokenExpiration,
        2 * 60 * 1000
      );
    } else {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
        tokenCheckInterval.current = null;
      }
    }

    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
        tokenCheckInterval.current = null;
      }
    };
  }, [isAuthenticated, token, socket, checkTokenExpiration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
    };
  }, []);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
