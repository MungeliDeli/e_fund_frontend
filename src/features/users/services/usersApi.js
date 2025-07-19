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

import axios from 'axios';

// Base URL for user-related API endpoints
const API_BASE_URL = 'http://localhost:3000/api/v1/users';

/**
 * Configured axios instance with default settings and interceptors
 * - Base URL: Points to user API endpoints
 * - Timeout: 10 seconds for all requests
 * - Content-Type: JSON by default (overridden for file uploads)
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request interceptor to automatically inject authentication tokens
 * This ensures all authenticated requests include the user's JWT token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Fetch public profile data for any user
 * 
 * @param {string} userId - The ID of the user whose profile to fetch
 * @returns {Promise<Object>} Public profile data (limited fields for privacy)
 * 
 * @example
 * const profile = await fetchPublicProfile('user123');
 * // Returns: { firstName, lastName, gender, country, city, etc. }
 */
export const fetchPublicProfile = async (userId) => {
  return api.get(`/${userId}/profile`).then(res => res.data);
};

/**
 * Fetch private profile data for the authenticated user
 * 
 * @returns {Promise<Object>} Complete profile data including private fields
 * 
 * @example
 * const profile = await fetchPrivateProfile();
 * // Returns: { email, phoneNumber, dateOfBirth, address, etc. }
 */
export const fetchPrivateProfile = async () => {
  return api.get('/me').then(res => res.data);
};

/**
 * Generate a signed URL for accessing media files stored in S3
 * 
 * @param {string} mediaId - The media record ID from the database
 * @returns {Promise<Object>} Media data including signed URL and metadata
 * 
 * @example
 * const mediaData = await getMediaUrl('media123');
 * // Returns: { url: 'https://s3...', expiresAt: '2024-...', ... }
 */
export const getMediaUrl = async (mediaId) => {
  return api.get(`/media/${mediaId}/url`).then(res => res.data);
};

/**
 * Upload profile and/or cover images
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
  if (profileFile) formData.append('profilePicture', profileFile);
  if (coverFile) formData.append('coverPicture', coverFile);
  
  return api.patch('/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
}; 