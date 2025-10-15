/**
 * Broadcast Notification Modal
 * Allows organizers to send notifications to all their subscribers
 */

import React, { useState } from "react";
import { FiX, FiSend, FiUsers } from "react-icons/fi";
import { useNotification } from "../../../contexts/NotificationContext";
import { broadcastNotification } from "../services/notificationsApi";

const BroadcastNotificationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "announcement",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await broadcastNotification(formData);

      if (response.data) {
        showSuccess(`Notification sent to ${response.data.sent} subscribers`);
        setFormData({
          title: "",
          message: "",
          category: "announcement",
          priority: "medium",
        });
        onClose();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[color:var(--color-background)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-muted)]">
          <div className="flex items-center gap-2">
            <FiUsers className="text-[color:var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
              Broadcast Notification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[color:var(--color-muted)] transition-colors"
          >
            <FiX className="w-5 h-5 text-[color:var(--color-secondary-text)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
              placeholder="Enter notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] resize-none"
              placeholder="Enter notification message"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
              >
                <option value="announcement">Announcement</option>
                <option value="campaign">Campaign Update</option>
                <option value="system">System</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[color:var(--color-secondary-text)] bg-[color:var(--color-muted)] rounded-md hover:bg-[color:var(--color-surface)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[color:var(--color-primary)] rounded-md hover:bg-[color:var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  Send to Subscribers
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BroadcastNotificationModal;


