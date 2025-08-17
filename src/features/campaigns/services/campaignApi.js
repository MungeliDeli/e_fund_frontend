/**
 * Campaign API Service
 *
 * Handles all campaign-related API calls including creating, updating,
 * and fetching campaigns. Provides methods for draft saving and campaign management.
 *
 * Key Features:
 * - Campaign CRUD operations
 * - Draft saving and management
 * - Campaign submission for approval
 * - Error handling and response formatting
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

// Campaign creation functionality removed during demolition

/**
 * Update an existing campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} updateData - Data to update
 * @param {Array<string>} categoryIds - Array of category IDs (optional)
 * @returns {Promise<Object>} Updated campaign
 */
export const updateCampaign = async (
  campaignId,
  updateData,
  categoryIds = null
) => {
  try {
    const payload = { ...updateData };
    if (categoryIds !== null) {
      payload.categoryIds = categoryIds;
    }

    const response = await apiClient.put(`/campaigns/${campaignId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to update campaign:", error);
    throw error;
  }
};

/**
 * Get a campaign by ID
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Campaign data
 */
export const getCampaignById = async (campaignId) => {
  try {
    const response = await apiClient.get(`/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get campaign:", error);
    throw error;
  }
};

/**
 * Get campaigns by organizer with optional filters
 * @param {Object} filters - Optional filters (status, search, limit, offset)
 * @returns {Promise<Array>} List of campaigns
 */
export const getCampaignsByOrganizer = async (filters = {}) => {
  try {
    const response = await apiClient.get("/campaigns/my-campaigns", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get campaigns:", error);
    throw error;
  }
};

/**
 * Get all campaigns with optional filters (for admin)
 * @param {Object} filters - Optional filters (status, search, limit, offset)
 * @returns {Promise<Array>} List of campaigns
 */
export const getAllCampaigns = async (filters = {}) => {
  try {
    const response = await apiClient.get("/campaigns/all", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get all campaigns:", error);
    throw error;
  }
};

// Draft functionality removed during demolition

// Campaign submission functionality removed during demolition

/**
 * Check if user can edit campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<boolean>} True if user can edit
 */
export const canEditCampaign = async (campaignId) => {
  try {
    const response = await apiClient.get(`/campaigns/${campaignId}/can-edit`);
    return response.data.canEdit;
  } catch (error) {
    console.error("Failed to check campaign edit permission:", error);
    return false;
  }
};

/**
 * Get campaign by share link (public endpoint)
 * @param {string} shareLink - Campaign share link
 * @returns {Promise<Object>} Campaign data
 */
export const getCampaignByShareLink = async (shareLink) => {
  try {
    const response = await apiClient.get(`/campaigns/share/${shareLink}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get campaign by share link:", error);
    throw error;
  }
};

/**
 * Load campaign draft from backend
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Campaign data
 */
export const loadCampaignDraft = async (campaignId) => {
  try {
    const response = await apiClient.get(`/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to load campaign draft:", error);
    throw error;
  }
};

/**
 * Delete campaign draft (if needed)
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<void>}
 */
export const deleteCampaignDraft = async (campaignId) => {
  try {
    await apiClient.delete(`/campaigns/${campaignId}`);
  } catch (error) {
    console.error("Failed to delete campaign draft:", error);
    throw error;
  }
};

/**
 * Manually publish a pendingStart campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Updated campaign
 */
export const publishPendingStartCampaign = async (campaignId) => {
  try {
    const response = await apiClient.post(`/campaigns/${campaignId}/publish`);
    return response.data;
  } catch (error) {
    console.error("Failed to publish campaign:", error);
    throw error;
  }
};
