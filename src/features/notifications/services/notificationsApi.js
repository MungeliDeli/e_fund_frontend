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

export default {
  getMyNotifications,
  markNotificationAsRead,
};
