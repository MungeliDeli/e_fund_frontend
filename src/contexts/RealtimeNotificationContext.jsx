/**
 * Real-time Notification Context
 * Manages real-time notifications via Socket.IO
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../features/notifications/services/notificationsApi";
import logger from "../utils/logger";

const RealtimeNotificationContext = createContext();

export const useRealtimeNotification = () => {
  const context = useContext(RealtimeNotificationContext);
  if (!context) {
    throw new Error(
      "useRealtimeNotification must be used within a RealtimeNotificationProvider"
    );
  }
  return context;
};

export const RealtimeNotificationProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await getMyNotifications({ unreadOnly: false });
      const notificationList = response?.data || response || [];
      setNotifications(notificationList);

      const unread = notificationList.filter((n) => !n.readAt).length;
      setUnreadCount(unread);

      // Update localStorage for badge
      try {
        localStorage.setItem("unreadNotifications", String(unread));
        window.dispatchEvent(new Event("notifications:update"));
      } catch (error) {
        logger.error("Failed to update localStorage:", error);
      }
    } catch (error) {
      logger.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      // Update notifications state first
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.notificationId === notificationId
            ? { ...n, readAt: new Date().toISOString() }
            : n
        );

        // Calculate new unread count from updated notifications
        const newUnreadCount = updated.filter((n) => !n.readAt).length;
        setUnreadCount(newUnreadCount);

        logger.info(
          "Marked notification as read, new unread count:",
          newUnreadCount
        );

        // Update localStorage
        try {
          localStorage.setItem("unreadNotifications", String(newUnreadCount));
          window.dispatchEvent(new Event("notifications:update"));
        } catch (error) {
          logger.error("Failed to update localStorage:", error);
        }

        return updated;
      });
    } catch (error) {
      logger.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.readAt);
      if (unreadNotifications.length === 0) return;

      await Promise.all(
        unreadNotifications.map((n) => markNotificationAsRead(n.notificationId))
      );

      // Update notifications state and unread count
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.readAt ? n : { ...n, readAt: new Date().toISOString() }
        );

        setUnreadCount(0);

        logger.info("Marked all notifications as read, unread count: 0");

        // Update localStorage
        try {
          localStorage.setItem("unreadNotifications", "0");
          window.dispatchEvent(new Event("notifications:update"));
        } catch (error) {
          logger.error("Failed to update localStorage:", error);
        }

        return updated;
      });
    } catch (error) {
      logger.error("Failed to mark all notifications as read:", error);
    }
  }, [notifications]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new notification
    const handleNewNotification = (notification) => {
      logger.info("Received new notification:", notification);
      setNotifications((prev) => {
        const updated = [notification, ...prev];
        const newUnreadCount = updated.filter((n) => !n.readAt).length;
        setUnreadCount(newUnreadCount);

        // Update localStorage
        try {
          localStorage.setItem("unreadNotifications", String(newUnreadCount));
          window.dispatchEvent(new Event("notifications:update"));
        } catch (error) {
          logger.error("Failed to update localStorage:", error);
        }

        return updated;
      });
    };

    // Handle unread count update
    const handleUnreadCount = (data) => {
      logger.info("Received unread count update:", data);
      setUnreadCount(data.count);

      // Update localStorage
      try {
        localStorage.setItem("unreadNotifications", String(data.count));
        window.dispatchEvent(new Event("notifications:update"));
      } catch (error) {
        logger.error("Failed to update localStorage:", error);
      }
    };

    // Handle socket disconnection
    const handleDisconnect = (reason) => {
      logger.warn(
        "Socket disconnected, notifications may not be real-time:",
        reason
      );
      // Don't clear notifications, just log the disconnection
      // The socket will attempt to reconnect automatically
    };

    // Handle socket reconnection
    const handleReconnect = () => {
      logger.info("Socket reconnected, real-time notifications restored");
      // Reload notifications to ensure we have the latest state
      loadNotifications();
    };

    // Register event listeners
    socket.on("notification:new", handleNewNotification);
    socket.on("notification:count", handleUnreadCount);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);

    // Cleanup
    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:count", handleUnreadCount);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [socket, isConnected, loadNotifications]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Sync with localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const storedCount = parseInt(
        localStorage.getItem("unreadNotifications") || "0",
        10
      );
      setUnreadCount(storedCount);
    } catch (error) {
      logger.error("Failed to read from localStorage:", error);
    }
  }, [isAuthenticated]);

  // Handle notifications page opened - mark all as read
  const handleNotificationsPageOpened = useCallback(async () => {
    logger.info("Notifications page opened, marking all as read");
    // Mark all notifications as read when page is opened
    await markAllAsRead();
  }, [markAllAsRead]);

  const value = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationsPageOpened,
    isConnected,
  };

  return (
    <RealtimeNotificationContext.Provider value={value}>
      {children}
    </RealtimeNotificationContext.Provider>
  );
};

export default RealtimeNotificationContext;
