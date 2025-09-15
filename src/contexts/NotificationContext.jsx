import React, { createContext, useContext, useState, useCallback } from "react";
import Notification from "../components/Notification";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      message,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const showSuccess = useCallback(
    (message, duration) => {
      return showNotification("success", message, duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message, duration) => {
      return showNotification("error", message, duration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message, duration) => {
      return showNotification("warning", message, duration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message, duration) => {
      return showNotification("info", message, duration);
    },
    [showNotification]
  );

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          isVisible={true}
          onClose={() => removeNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
