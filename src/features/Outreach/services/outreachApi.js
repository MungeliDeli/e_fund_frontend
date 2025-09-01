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
export const getCampaignAnalytics = async (campaignId) => {
  try {
    const response = await apiClient.get(`/outreach/analytics/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get campaign analytics:", error);
    throw error;
  }
};
