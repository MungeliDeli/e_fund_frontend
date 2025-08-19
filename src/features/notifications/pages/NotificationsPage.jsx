import React, { useEffect, useMemo, useState } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationsApi";
import {
  FiBell,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiFlag,
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

function DemarcationLine({ label }) {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[color:var(--color-muted)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[color:var(--color-background)] px-3 text-sm font-medium text-[color:var(--color-secondary-text)]">
          {label}
        </span>
      </div>
    </div>
  );
}

function NotificationItem({ notification }) {
  const { notificationId, title, message, createdAt, readAt, category } =
    notification;

  // Parse data payload (can be object or JSON string)
  let data = null;
  if (notification && notification.data) {
    if (typeof notification.data === "string") {
      try {
        data = JSON.parse(notification.data);
      } catch {
        data = null;
      }
    } else if (typeof notification.data === "object") {
      data = notification.data;
    }
  }

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
          {data?.route && (
            <>
              {" "}
              <a
                href={
                  data.route.startsWith("http")
                    ? data.route
                    : `${window.location.origin}${data.route}`
                }
                className="text-[color:var(--color-primary)] underline hover:underline font-medium"
              >
                See it here
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMarkedOnView, setHasMarkedOnView] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications]
  );

  const { unreadNotifications, readNotifications } = useMemo(() => {
    const unread = notifications.filter((n) => !n.readAt);
    const read = notifications.filter((n) => n.readAt);
    return { unreadNotifications: unread, readNotifications: read };
  }, [notifications]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyNotifications({ unreadOnly: false });
      console.log("res", res.data);
      const payload = res?.data || res; // support both wrapped/unwrapped
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      setNotifications(list);
      const unread = list.filter((x) => !x.readAt).length;
      try {
        localStorage.setItem("unreadNotifications", String(unread));
        window.dispatchEvent(new Event("notifications:update"));
      } catch {}
    } catch (e) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically mark all notifications as read when viewing the page (once)
  useEffect(() => {
    if (loading) return;
    if (hasMarkedOnView) return;
    const unread = notifications.filter((n) => !n.readAt);
    if (unread.length === 0) {
      try {
        localStorage.setItem("unreadNotifications", "0");
        window.dispatchEvent(new Event("notifications:update"));
      } catch {}
      setHasMarkedOnView(true);
      return;
    }

    // Add a delay so users can see the demarcation line before notifications are marked as read
    const timer = setTimeout(async () => {
      try {
        await Promise.all(
          unread.map((n) =>
            markNotificationAsRead(n.notificationId).catch(() => null)
          )
        );
        setNotifications((prev) =>
          prev.map((n) =>
            n.readAt ? n : { ...n, readAt: new Date().toISOString() }
          )
        );
        try {
          localStorage.setItem("unreadNotifications", "0");
          window.dispatchEvent(new Event("notifications:update"));
        } catch {}
      } finally {
        setHasMarkedOnView(true);
      }
    }, 60 * 1000); // 1 minute delay

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, notifications]);

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
      </div>

      {/* Filter controls removed for simplicity */}

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
          <>
            {/* Unread notifications */}
            {unreadNotifications.map((n) => (
              <NotificationItem key={n.notificationId} notification={n} />
            ))}

            {/* Demarcation line between unread and read */}
            {unreadNotifications.length > 0 && readNotifications.length > 0 && (
              <DemarcationLine label="Earlier notifications" />
            )}

            {/* Read notifications */}
            {readNotifications.map((n) => (
              <NotificationItem key={n.notificationId} notification={n} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
