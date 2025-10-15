/**
 * Notifications API
 * Provides methods to load current user's notifications and mark them as read.
 */

import apiClient from "../../../services/apiClient";

export const getMyNotifications = async ({ unreadOnly = false } = {}) => {
  const response = await apiClient.get("/notifications", {
    params: unreadOnly ? { unread: true } : {},
  });
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.patch(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get("/notifications/unread-count");
  return response.data;
};

export const broadcastNotification = async (notificationData) => {
  const response = await apiClient.post(
    "/notifications/broadcast",
    notificationData
  );
  return response.data;
};

export const testNotification = async () => {
  const response = await apiClient.post("/notifications/test");
  return response.data;
};

export default {
  getMyNotifications,
  markNotificationAsRead,
  getUnreadCount,
  broadcastNotification,
  testNotification,
};
