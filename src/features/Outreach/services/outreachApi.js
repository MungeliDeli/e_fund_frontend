/**
 * Outreach API Service
 *
 * Handles all outreach-related API calls including segments and contacts management.
 * Provides methods for fetching segments, contacts, and managing contact lists.
 *
 * Key Features:
 * - Segment CRUD operations
 * - Contact CRUD operations within segments
 * - Contact list management
 * - Error handling and response formatting
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

/**
 * Get all segments for the authenticated organizer
 * @returns {Promise<Array>} List of segments
 */
export const getSegments = async () => {
  try {
    const response = await apiClient.get("/outreach/segments");
    return response.data;
  } catch (error) {
    console.error("Failed to get segments:", error);
    throw error;
  }
};

/**
 * Get a segment by ID
 * @param {string} segmentId - Segment ID
 * @returns {Promise<Object>} Segment data
 */
export const getSegmentById = async (segmentId) => {
  try {
    const response = await apiClient.get(`/outreach/segments/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get segment:", error);
    throw error;
  }
};

/**
 * Create a new segment
 * @param {Object} segmentData - Segment data including name and description
 * @returns {Promise<Object>} Created segment
 */
export const createSegment = async (segmentData) => {
  try {
    const response = await apiClient.post("/outreach/segments", segmentData);
    return response.data;
  } catch (error) {
    console.error("Failed to create segment:", error);
    throw error;
  }
};

/**
 * Update an existing segment
 * @param {string} segmentId - Segment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated segment
 */
export const updateSegment = async (segmentId, updateData) => {
  try {
    const response = await apiClient.put(
      `/outreach/segments/${segmentId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update segment:", error);
    throw error;
  }
};

/**
 * Delete a segment
 * @param {string} segmentId - Segment ID
 * @returns {Promise<void>}
 */
export const deleteSegment = async (segmentId) => {
  try {
    await apiClient.delete(`/outreach/segments/${segmentId}`);
  } catch (error) {
    console.error("Failed to delete segment:", error);
    throw error;
  }
};

/**
 * Get contacts for a specific segment
 * @param {string} segmentId - Segment ID
 * @param {Object} filters - Optional filters (search, limit, offset)
 * @returns {Promise<Array>} List of contacts
 */
export const getContactsBySegment = async (segmentId, filters = {}) => {
  try {
    const response = await apiClient.get(`/outreach/contacts/${segmentId}`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get contacts by segment:", error);
    throw error;
  }
};

/**
 * Get a contact by ID
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Contact data
 */
export const getContactById = async (contactId) => {
  try {
    const response = await apiClient.get(`/outreach/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get contact:", error);
    throw error;
  }
};

/**
 * Create a new contact in a segment
 * @param {string} segmentId - Segment ID
 * @param {Object} contactData - Contact data including name, email, description
 * @returns {Promise<Object>} Created contact
 */
export const createContact = async (segmentId, contactData) => {
  try {
    // Backend route for create is POST /outreach/contacts/:segmentId
    const response = await apiClient.post(
      `/outreach/contacts/${segmentId}`,
      contactData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create contact:", error);
    throw error;
  }
};

/**
 * Bulk create contacts in a segment
 * @param {string} segmentId - Segment ID
 * @param {Array<{name:string,email:string,description?:string}>} contacts - Contacts to add
 * @returns {Promise<Object>} Result summary and created contacts
 */
export const bulkCreateContacts = async (segmentId, contacts) => {
  try {
    const response = await apiClient.post(
      `/outreach/contacts/${segmentId}/bulk`,
      { contacts }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to bulk create contacts:", error);
    throw error;
  }
};

/**
 * Update an existing contact
 * @param {string} contactId - Contact ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated contact
 */
export const updateContact = async (contactId, updateData) => {
  try {
    const response = await apiClient.put(
      `/outreach/contacts/${contactId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update contact:", error);
    throw error;
  }
};

/**
 * Delete a contact
 * @param {string} contactId - Contact ID
 * @returns {Promise<void>}
 */
export const deleteContact = async (contactId) => {
  try {
    await apiClient.delete(`/outreach/contacts/${contactId}`);
  } catch (error) {
    console.error("Failed to delete contact:", error);
    throw error;
  }
};

/**
 * Send outreach email to contacts or segments
 * @param {Object} emailData - Email data including campaignId, segmentId/contactId, type, etc.
 * @returns {Promise<Object>} Email sending result
 */
export const sendOutreachEmail = async (emailData) => {
  try {
    const response = await apiClient.post("/outreach/send-email", emailData);
    return response.data;
  } catch (error) {
    console.error("Failed to send outreach email:", error);
    throw error;
  }
};

/**
 * Get campaign outreach analytics
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Campaign analytics data
 */
export const getCampaignAnalytics = async (campaignId, params = {}) => {
  try {
    const response = await apiClient.get(`/outreach/analytics/${campaignId}`, {
      params,
    });
    // Backend returns { success, message, data }
    const raw = response?.data?.data || response?.data || {};
    // Normalize keys for UI expectations
    return {
      campaignId: raw.campaignId,
      outreachCampaigns: raw.outreachCampaigns || 0,
      emailsSent: raw.totalSends || 0,
      opens: raw.totalOpens || 0,
      clicks: raw.totalClicks || 0,
      donations: raw.totalDonations || 0,
      revenue: raw.totalDonationAmount || 0,
      openRate: raw.openRate || 0,
      clickRate: raw.clickRate || 0,
      conversionRate: raw.conversionRate || 0,
      totalSocialShares: raw.totalSocialShares || 0,
      socialClicks: raw.totalSocialClicks || 0,
    };
  } catch (error) {
    console.error("Failed to get campaign analytics:", error);
    throw error;
  }
};

/**
 * Get organizer-level outreach analytics across campaigns
 * @param {Object} params - Optional filters { dateRange, type }
 */
export const getOrganizerAnalytics = async (params = {}) => {
  try {
    console.log("Getting organizer analytics with params:", params);
    const response = await apiClient.get(`/outreach/analytics/organizer`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get organizer analytics:", error);
    throw error;
  }
};

/**
 * Generate social media sharing links for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} options - Sharing options
 * @returns {Promise<Object>} Social media links
 */
export const generateSocialMediaLinks = async (campaignId, options = {}) => {
  try {
    const response = await apiClient.post(
      `/outreach/social-media/campaigns/${campaignId}/generate-links`,
      options
    );
    const raw = response?.data?.data || response?.data || {};
    return raw;
  } catch (error) {
    console.error("Failed to generate social media links:", error);
    throw error;
  }
};

/**
 * Get social media statistics for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Social media statistics
 */
export const getSocialMediaStats = async (campaignId) => {
  try {
    const response = await apiClient.get(
      `/outreach/social-media/campaigns/${campaignId}/social-stats`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get social media stats:", error);
    throw error;
  }
};

// ===== OUTREACH CAMPAIGNS API METHODS =====

/**
 * Create a new outreach campaign for a fundraising campaign
 * @param {string} campaignId - Fundraising campaign ID
 * @param {Object} data - Outreach campaign data { name, description }
 * @returns {Promise<Object>} Created outreach campaign
 */
export const createOutreachCampaign = async (campaignId, data) => {
  try {
    const response = await apiClient.post(
      `/outreach/campaigns/${campaignId}/outreach-campaigns`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create outreach campaign:", error);
    throw error;
  }
};

/**
 * Get all outreach campaigns for a fundraising campaign
 * @param {string} campaignId - Fundraising campaign ID
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Array>} List of outreach campaigns
 */
export const listOutreachCampaigns = async (campaignId, params = {}) => {
  try {
    const response = await apiClient.get(
      `/outreach/campaigns/${campaignId}/outreach-campaigns`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to list outreach campaigns:", error);
    throw error;
  }
};

/**
 * Get a specific outreach campaign with analytics
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @returns {Promise<Object>} Outreach campaign with stats and recipients
 */
export const getOutreachCampaign = async (outreachCampaignId) => {
  try {
    const response = await apiClient.get(
      `/outreach/outreach-campaigns/${outreachCampaignId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get outreach campaign:", error);
    throw error;
  }
};

/**
 * Update an outreach campaign
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @param {Object} data - Update data { name, description, status }
 * @returns {Promise<Object>} Updated outreach campaign
 */
export const updateOutreachCampaign = async (outreachCampaignId, data) => {
  try {
    const response = await apiClient.patch(
      `/outreach/outreach-campaigns/${outreachCampaignId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update outreach campaign:", error);
    throw error;
  }
};

/**
 * Archive an outreach campaign
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @returns {Promise<Object>} Archived outreach campaign
 */
export const archiveOutreachCampaign = async (outreachCampaignId) => {
  try {
    const response = await apiClient.post(
      `/outreach/outreach-campaigns/${outreachCampaignId}/archive`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to archive outreach campaign:", error);
    throw error;
  }
};

/**
 * Send invitation emails for an outreach campaign
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @param {Object} payload - Invitation data { campaignId, recipients[], message, prefillAmount, utmParams }
 * @returns {Promise<Object>} Sending result with success/failure counts
 */
export const sendOutreachInvitations = async (outreachCampaignId, payload) => {
  try {
    const response = await apiClient.post(
      `/outreach/outreach-campaigns/${outreachCampaignId}/send-invitations`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send outreach invitations:", error);
    throw error;
  }
};

/**
 * Add recipients to an outreach campaign by segments or all contacts
 * @param {string} outreachCampaignId
 * @param {{segmentIds?: string[], all?: boolean}} payload
 */
export const addOutreachRecipients = async (outreachCampaignId, payload) => {
  try {
    const response = await apiClient.post(
      `/outreach/outreach-campaigns/${outreachCampaignId}/recipients`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add outreach recipients:", error);
    throw error;
  }
};

/**
 * Resend failed invitations for an outreach campaign
 * @param {string} outreachCampaignId
 */
export const resendFailedInvitations = async (outreachCampaignId) => {
  try {
    const response = await apiClient.post(
      `/outreach/outreach-campaigns/${outreachCampaignId}/resend-failed`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to resend failed invitations:", error);
    throw error;
  }
};

/**
 * Get outreach campaign statistics (included in getOutreachCampaign)
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @returns {Promise<Object>} Campaign statistics
 */
export const getOutreachCampaignStats = async (outreachCampaignId) => {
  try {
    const response = await apiClient.get(
      `/outreach/outreach-campaigns/${outreachCampaignId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get outreach campaign stats:", error);
    throw error;
  }
};

/**
 * Get email events for an outreach campaign with pagination
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @param {Object} params - Query parameters { page, limit, type }
 * @returns {Promise<Object>} Paginated email events
 */
export const getOutreachCampaignEvents = async (
  outreachCampaignId,
  params = {}
) => {
  try {
    const response = await apiClient.get(
      `/outreach/outreach-campaigns/${outreachCampaignId}/events`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get outreach campaign events:", error);
    throw error;
  }
};

/**
 * Send update emails for an outreach campaign
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @param {Object} payload - Update data { message, targetAudience, utmParams }
 * @returns {Promise<Object>} Sending result with success/failure counts
 */
export const sendOutreachUpdates = async (outreachCampaignId, payload) => {
  try {
    const response = await apiClient.post(
      `/outreach/outreach-campaigns/${outreachCampaignId}/send-updates`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send outreach updates:", error);
    throw error;
  }
};

/**
 * Send thank-you emails for an outreach campaign (to donors only)
 * @param {string} outreachCampaignId - Outreach campaign ID
 * @param {Object} payload - Thank-you data { message, utmParams }
 * @returns {Promise<Object>} Sending result with success/failure counts
 */
export const sendOutreachThanks = async (outreachCampaignId, payload) => {
  try {
    const response = await apiClient.post(
      `/outreach/outreach-campaigns/${outreachCampaignId}/send-thanks`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send outreach thank-yous:", error);
    throw error;
  }
};
