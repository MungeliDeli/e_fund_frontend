import apiClient from "../../../services/apiClient";

/**
 * Get featured messages for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {number} limit - Maximum number of messages to return
 * @returns {Promise<Object>} Featured messages
 */
export const getFeaturedMessages = async (campaignId, limit = 10) => {
  const response = await apiClient.get(
    `/messages/campaign/${campaignId}/featured?limit=${limit}`
  );
  return response.data;
};

/**
 * Get public approved messages for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} options - { limit, offset, status }
 * @returns {Promise<Object>} Messages response
 */
export const getMessagesByCampaign = async (
  campaignId,
  { limit = 50, offset = 0, status = "approved" } = {}
) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (limit) params.append("limit", String(limit));
  if (offset) params.append("offset", String(offset));
  const response = await apiClient.get(
    `/messages/campaign/${campaignId}?${params.toString()}`
  );
  return response.data;
};

/**
 * Get pending messages count for a campaign (organizer-only)
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Pending count
 */
export const getPendingMessagesCount = async (campaignId) => {
  const response = await apiClient.get(
    `/messages/organizer/campaign/${campaignId}/pending-count`
  );
  return response.data;
};

/**
 * Get messages by campaign for organizers
 * @param {string} campaignId - Campaign ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Messages for the campaign
 */
export const getMessagesByCampaignForOrganizer = async (
  campaignId,
  options = {}
) => {
  const { status, limit = 50, offset = 0 } = options;
  const params = new URLSearchParams();

  if (status) params.append("status", status);
  if (limit) params.append("limit", limit);
  if (offset) params.append("offset", offset);

  const response = await apiClient.get(
    `/messages/organizer/campaign/${campaignId}?${params.toString()}`
  );
  return response.data;
};

/**
 * Moderate a message
 * @param {string} messageId - Message ID
 * @param {Object} data - Moderation data
 * @returns {Promise<Object>} Updated message
 */
export const moderateMessage = async (messageId, data) => {
  const response = await apiClient.patch(
    `/messages/organizer/${messageId}/moderate`,
    data
  );
  return response.data;
};

/**
 * Toggle featured status for a message
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} Updated message
 */
export const toggleFeaturedStatus = async (messageId) => {
  const response = await apiClient.patch(
    `/messages/organizer/${messageId}/toggle-featured`
  );
  return response.data;
};

/**
 * Bulk approve all pending messages for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Result of bulk operation
 */
export const bulkApproveAllMessages = async (campaignId) => {
  const response = await apiClient.patch(
    `/messages/organizer/campaign/${campaignId}/bulk-approve`
  );
  return response.data;
};

/**
 * Bulk reject all pending messages for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Result of bulk operation
 */
export const bulkRejectAllMessages = async (campaignId) => {
  const response = await apiClient.patch(
    `/messages/organizer/campaign/${campaignId}/bulk-reject`
  );
  return response.data;
};

/**
 * Get campaign message statistics
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Message statistics
 */
export const getCampaignMessageStats = async (campaignId) => {
  const response = await apiClient.get(
    `/messages/organizer/campaign/${campaignId}/stats`
  );
  return response.data;
};
