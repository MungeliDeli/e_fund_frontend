import React, { useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from "react-icons/fi";

const Notification = ({
  type = "success",
  message,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="w-5 h-5" />;
      case "error":
        return <FiXCircle className="w-5 h-5" />;
      case "warning":
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiCheckCircle className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: "text-green-600",
          closeButton: "text-green-600 hover:bg-green-100",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: "text-red-600",
          closeButton: "text-red-600 hover:bg-red-100",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: "text-yellow-600",
          closeButton: "text-yellow-600 hover:bg-yellow-100",
        };
      default:
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: "text-blue-600",
          closeButton: "text-blue-600 hover:bg-blue-100",
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`flex items-center p-4 rounded-lg border shadow-lg ${styles.container}`}
      >
        <div className={`flex-shrink-0 ${styles.icon}`}>{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.closeButton}`}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
