/**
 * Auth API Service
 *
 * Provides all authentication-related API calls and manages token refresh logic.
 * Handles login, registration, token refresh, and automatic token injection for requests.
 *
 * Key Features:
 * - Login, registration, and token refresh endpoints
 * - Axios interceptors for token injection and refresh
 * - Automatic retry of failed requests after token refresh
 * - Handles logout on refresh failure
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from '../../../services/apiClient';

/**
 * Register a new user
 * @param {Object} data - Registration data (email, phoneNumber, firstName, ...)
 * @returns {Promise}
 */
export const register = async (data) => {
  return apiClient.post('/auth/register', data);
};

/**
 * Log in a user
 * @param {Object} data - Login data (email, password)
 * @returns {Promise}
 */
export const login = async (data) => {
  return apiClient.post('/auth/login', data);
};

/**
 * Refresh the access token using a refresh token
 * @param {string} refreshToken
 * @returns {Promise}
 */
export const refreshToken = async (refreshToken) => {
  return apiClient.post('/auth/refresh-token', { refreshToken },{ skipAuthInterceptor: true });
};

/**
 * Verify user's email address
 * @param {string} token - The email verification token
 * @returns {Promise}
 */
export const verifyEmail = async (token) => {
  return apiClient.post('/auth/verify-email', { token });
};

/**
 * Resend the verification email
 * @param {string} email - The user's email address
 * @returns {Promise}
 */
export const resendVerificationEmail = async (email) => {
  return apiClient.post('/auth/resend-verification', { email });
};

/**
 * Send a password reset email
 * @param {string} email - The user's email address
 * @returns {Promise}
 */
export const forgotPassword = async (email) => {
  return apiClient.post('/auth/forgot-password', { email });
};

/**
 * Reset the user's password
 * @param {Object} data - The reset data
 * @param {string} data.token - The password reset token
 * @param {string} data.password - The new password
 * @returns {Promise}
 */
export const resetPassword = async (data) => {
  // The backend expects { resetToken, newPassword }
  return apiClient.post('/auth/reset-password', {
    resetToken: data.token,
    newPassword: data.password
  });
};

/**
 * Create an organization user (admin only)
 * @param {FormData} formData - All fields and files as FormData
 * @returns {Promise}
 */
export const createOrganizationUser = (formData) => {
  return apiClient.post('auth/create-organization-user', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Activate and set password for organization user (account setup)
 * @param {Object} data - The setup data
 * @param {string} data.token - The setup token
 * @param {string} data.password - The new password
 * @returns {Promise}
 */
export const activateAndSetPassword = async (data) => {
  return apiClient.post('/auth/activate-and-set-password', {
    token: data.token,
    newPassword: data.password
  });
};


// Add more auth-related API calls as needed 