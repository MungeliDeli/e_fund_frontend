import React, { useEffect, useMemo, useState } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationsApi";
import {
  FiBell,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";

function Badge({ visible }) {
  if (!visible) return null;
  return (
    <span
      className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)] ring-2 ring-[color:var(--color-background)]"
      aria-hidden="true"
    />
  );
}

function NotificationItem({ notification, onMarkRead }) {
  const { id, title, message, createdAt, readAt, category, priority, type } =
    notification;

  const icon = useMemo(() => {
    switch (category) {
      case "campaign":
        return <FiFlag className="text-[color:var(--color-primary)]" />;
      case "system":
        return <FiInfo className="text-blue-500" />;
      case "warning":
        return <FiAlertTriangle className="text-yellow-500" />;
      case "error":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiBell className="text-[color:var(--color-primary)]" />;
    }
  }, [category]);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        readAt
          ? "bg-[color:var(--color-surface)]/40 border-[color:var(--color-muted)]"
          : "bg-[color:var(--color-surface)] border-[color:var(--color-primary)]/30"
      }`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[color:var(--color-primary-text)] truncate">
            {title}
          </h4>
          <span className="text-xs text-[color:var(--color-secondary-text)] ml-2 whitespace-nowrap">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-[color:var(--color-secondary-text)] mt-1 break-words">
          {message}
        </p>
        {!readAt && (
          <button
            onClick={() => onMarkRead(id)}
            className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/20"
          >
            <FiCheckCircle /> Mark as read
          </button>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | unread

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications]
  );

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyNotifications({ unreadOnly: filter === "unread" });
      const payload = res?.data || res; // support both wrapped/unwrapped
      setNotifications(Array.isArray(payload) ? payload : payload?.data || []);
    } catch (e) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const onMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    } catch (e) {
      // no-op UI error for now
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[color:var(--color-primary-text)]">
          Notifications
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiBell className="text-xl text-[color:var(--color-primary-text)]" />
            <Badge visible={unreadCount > 0} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          className={`px-3 py-1 rounded border text-sm ${
            filter === "all"
              ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]"
              : "bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:border-[color:var(--color-primary)]/50"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded border text-sm ${
            filter === "unread"
              ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]"
              : "bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:border-[color:var(--color-primary)]/50"
          }`}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-[color:var(--color-secondary-text)]">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-[color:var(--color-secondary-text)]">
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
