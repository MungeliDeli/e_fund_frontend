/**
 * Users API Service
 *
 * This module provides all API calls related to user profile management.
 * It handles both public and private profile fetching, image uploads, and media URL generation.
 *
 * Key Features:
 * - Public/private profile fetching
 * - Profile image uploads (profile & cover photos)
 * - Media URL generation for S3-stored images
 * - Automatic token injection for authenticated requests
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

/**
 * Fetch public profile data for any user
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<Object>} Public profile data
 *
 * @example
 * const profile = await fetchPublicProfile('user-123');
 * // Returns: { firstName, lastName, gender, country, city, etc. }
 */
export const fetchPublicProfile = async (userId) => {
  return apiClient.get(`/users/${userId}/profile`).then((res) => res.data);
};

/**
 * Fetch private profile data for the currently authenticated individual user
 * @returns {Promise<Object>} Private profile data
 *
 * @example
 * const myProfile = await fetchPrivateProfile();
 * // Returns: { email, phoneNumber, dateOfBirth, address, etc. }
 */
export const fetchPrivateProfile = async () => {
  return apiClient.get("/users/me").then((res) => res.data);
};

/**
 * Fetch private profile data for the currently authenticated organization user
 * @returns {Promise<Object>} Private organization profile data
 *
 * @example
 * const myOrgProfile = await fetchPrivateOrganizationProfile();
 * // Returns: { email, organizationName, officialEmail, etc. }
 */
export const fetchPrivateOrganizationProfile = async () => {
  return apiClient.get("/organizations/me").then((res) => res.data);
};

/**
 * Update the profile information for the authenticated user
 * @param {Object} data - The profile data to update
 * @returns {Promise<Object>} Updated profile data
 *
 * @example
 * await updateUserProfile({ firstName: 'John', city: 'New York' });
 */
export const updateUserProfile = async (data) => {
  return apiClient.put("/users/me/profile", data);
};

/**
 * Update organization profile information for the authenticated organizer
 * @param {Object} data - The organization profile data to update
 * @returns {Promise<Object>} Updated profile data
 *
 * @example
 * await updateOrganizationProfile({ organizationName: 'New Org', organizationType: 'NGO' });
 */
export const updateOrganizationProfile = async (data) => {
  return apiClient.put("/organizations/me/profile", data);
};

/**
 * Update payout settings for the authenticated organizer
 * @param {Object} data - The payout settings data to update
 * @returns {Promise<Object>} Updated profile data
 *
 * @example
 * await updatePayoutSettings({ payoutDisplayName: 'Church Mobile Money', payoutPhoneNumber: '26097xxxxxxx', payoutNetwork: 'mtn' });
 */
export const updatePayoutSettings = async (data) => {
  return apiClient.put("/organizations/me/payout-settings", data);
};

/**
 * Update organization profile information with images for the authenticated organizer
 * @param {FormData} formData - The form data including profile data and image files
 * @returns {Promise<Object>} Updated profile data
 *
 * @example
 * const formData = new FormData();
 * formData.append('organizationName', 'New Org');
 * formData.append('profilePicture', profileFile);
 * await updateOrganizationProfileWithImages(formData);
 */
export const updateOrganizationProfileWithImages = async (formData) => {
  return apiClient.put("/organizations/me/profile-with-images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000, // 60 seconds for large/compressed images
  });
};

/**
 * Fetch a specific organizer by ID (admin only)
 * @param {string} organizerId - The ID of the organizer to fetch
 * @returns {Promise<Object>} Organizer data
 *
 * @example
 * await fetchOrganizerById('organizer-123');
 */
export const fetchOrganizerById = async (organizerId) => {
  return apiClient
    .get(`/organizations/${organizerId}/profile`)
    .then((res) => res.data);
};

/**
 * Upload profile and/or cover images for individual users
 *
 * @param {Object} params - Upload parameters
 * @param {File} [params.profileFile] - Profile picture file
 * @param {File} [params.coverFile] - Cover picture file
 * @returns {Promise<Object>} Updated profile data with new media IDs
 *
 * @example
 * const result = await uploadProfileImages({
 *   profileFile: profilePicFile,
 *   coverFile: coverPicFile
 * });
 */
export const uploadProfileImages = async ({ profileFile, coverFile }) => {
  const formData = new FormData();
  if (profileFile) {
    formData.append("profilePicture", profileFile);
  }
  if (coverFile) {
    formData.append("coverPicture", coverFile);
  }

  return apiClient.patch("/users/me/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000, // 60 seconds for large/compressed images
  });
};

/**
 * Upload profile and/or cover images for organization users
 *
 * @param {Object} params - Upload parameters
 * @param {File} [params.profileFile] - Profile picture file
 * @param {File} [params.coverFile] - Cover picture file
 * @returns {Promise<Object>} Updated profile data with new media IDs
 *
 * @example
 * const result = await uploadOrganizationImages({
 *   profileFile: profilePicFile,
 *   coverFile: coverPicFile
 * });
 */
export const uploadOrganizationImages = async ({ profileFile, coverFile }) => {
  const formData = new FormData();
  if (profileFile) {
    formData.append("profilePicture", profileFile);
  }
  if (coverFile) {
    formData.append("coverPicture", coverFile);
  }

  return apiClient.patch("/organizations/me/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000, // 60 seconds for large/compressed images
  });
};

/**
 * Get the full URL for a media file (individual users)
 * @param {string} mediaId - The ID of the media file
 * @returns {string} The full URL to the media file
 */
export const getMediaUrl = async (mediaId) => {
  const data = await apiClient
    .get(`/users/media/${mediaId}/url`)
    .then((res) => res.data.data);

  return data;
};

/**
 * Get the full URL for a media file (organization users)
 * @param {string} mediaId - The ID of the media file
 * @returns {string} The full URL to the media file
 */
export const getOrganizationMediaUrl = async (mediaId) => {
  const data = await apiClient
    .get(`/organizations/media/${mediaId}/url`)
    .then((res) => res.data.data);

  return data;
};

/**
 * Fetch a list of organizers (organization users) with optional filters
 * @param {Object} filters - { verified, active, search }
 * @returns {Promise<Array>} List of organizers
 *
 * @example
 * const organizers = await fetchOrganizers({ verified: true, active: true, search: 'john' });
 */
export const fetchOrganizers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.verified !== undefined)
    params.append("verified", filters.verified);
  if (filters.active !== undefined) params.append("active", filters.active);
  if (filters.search) params.append("search", filters.search);
  const url = `/organizations/organizers${
    params.toString() ? "?" + params.toString() : ""
  }`;
  const res = await apiClient.get(url);
  return res.data.data;
};

/**
 * Fetch all organizers (organization users) without filters (for stats)
 * @returns {Promise<Array>} List of all organizers
 *
 * @example
 * const allOrganizers = await fetchAllOrganizers();
 */
export const fetchAllOrganizers = async () => {
  const res = await apiClient.get("/organizations/organizers");
  return res.data.data;
};

/**
 * Fetch campaign counts for all organizers by getting all campaigns and counting
 * @returns {Promise<Object>} Object with organizerId as key and campaign count as value
 *
 * @example
 * const counts = await getOrganizerCampaignCounts();
 */
export const getOrganizerCampaignCounts = async () => {
  try {
    console.log("Fetching all campaigns to count by organizer..."); // Debug log
    const res = await apiClient.get("/campaigns/all");
    const campaigns = res.data?.data || res.data || [];
    console.log("All campaigns:", campaigns); // Debug log

    // Count campaigns by organizer
    const counts = {};
    campaigns.forEach((campaign) => {
      const organizerId = campaign.organizerId;
      if (organizerId) {
        counts[organizerId] = (counts[organizerId] || 0) + 1;
      }
    });

    console.log("Campaign counts by organizer:", counts); // Debug log
    return counts;
  } catch (error) {
    console.error("Failed to fetch campaign counts:", error);
    console.error("Error details:", error.response?.data); // Debug log
    return {};
  }
};

/**
 * Fetch a list of individual users with optional filters
 * @param {Object} filters - { emailVerified, active, search }
 * @returns {Promise<Array>} List of individual users
 *
 * @example
 * const users = await fetchUsers({ emailVerified: true, active: true, search: 'john' });
 */
export const fetchUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.emailVerified !== undefined)
    params.append("emailVerified", filters.emailVerified);
  if (filters.active !== undefined) params.append("active", filters.active);
  if (filters.search) params.append("search", filters.search);
  const url = `/users${params.toString() ? "?" + params.toString() : ""}`;
  const res = await apiClient.get(url);
  return res.data.data;
};

/**
 * Fetch all individual users without filters (for stats)
 * @returns {Promise<Array>} List of all individual users
 *
 * @example
 * const allUsers = await fetchAllUsers();
 */
export const fetchAllUsers = async () => {
  const res = await apiClient.get("/users");
  return res.data.data;
};

/**
 * Toggle user active status (admin only)
 * @param {string} userId - User ID to toggle
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object>} Updated user data
 *
 * @example
 * await toggleUserStatus('user-123', false);
 */
export const toggleUserStatus = async (userId, isActive) => {
  const res = await apiClient.patch(`/users/${userId}/status`, { isActive });
  return res.data.data;
};

/**
 * Make user an admin (super admin only)
 * @param {string} userId - User ID to promote to admin
 * @param {string} adminRole - Admin role to assign (default: supportAdmin)
 * @returns {Promise<Object>} Updated user data
 *
 * @example
 * await makeUserAdmin('user-123', 'supportAdmin');
 */
export const makeUserAdmin = async (userId, adminRole = "supportAdmin") => {
  const res = await apiClient.patch(`/users/${userId}/make-admin`, {
    adminRole,
  });
  return res.data.data;
};

/**
 * Fetch a list of admin users with optional filters
 * @param {Object} filters - { emailVerified, active, search }
 * @returns {Promise<Array>} List of admin users
 *
 * @example
 * const admins = await fetchAdmins({ emailVerified: true, active: true, search: 'john' });
 */
export const fetchAdmins = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.emailVerified !== undefined)
    params.append("emailVerified", filters.emailVerified);
  if (filters.active !== undefined) params.append("active", filters.active);
  if (filters.search) params.append("search", filters.search);
  const url = `/users/admins${
    params.toString() ? "?" + params.toString() : ""
  }`;
  const res = await apiClient.get(url);
  return res.data.data;
};

/**
 * Fetch all admin users without filters (for stats)
 * @returns {Promise<Array>} List of all admin users
 *
 * @example
 * const allAdmins = await fetchAllAdmins();
 */
export const fetchAllAdmins = async () => {
  const res = await apiClient.get("/users/admins");
  return res.data.data;
};

/**
 * Remove admin privileges from user (super admin only)
 * @param {string} userId - User ID to remove admin privileges from
 * @returns {Promise<Object>} Updated user data
 *
 * @example
 * await removeAdminPrivileges('user-123');
 */
export const removeAdminPrivileges = async (userId) => {
  const res = await apiClient.patch(`/users/${userId}/remove-admin`);
  return res.data.data;
};

/**
 * Toggle organizer active status (admin only)
 * @param {string} organizerId - Organizer ID to toggle
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object>} Updated organizer data
 *
 * @example
 * await toggleOrganizerStatus('organizer-123', false);
 */
export const toggleOrganizerStatus = async (organizerId, isActive) => {
  const res = await apiClient.patch(`/organizations/${organizerId}/status`, {
    isActive,
  });
  return res.data.data;
};
