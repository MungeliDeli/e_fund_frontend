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

import axios from 'axios';

// Set your backend base URL here
const API_BASE_URL = 'http://localhost:3000/api/v1/auth';

/**
 * Configured axios instance for auth endpoints
 * - Injects JWT token into headers
 * - Handles token refresh on 401 errors
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request interceptor: injects JWT token from localStorage if present
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

// Token refresh state and queue for concurrent requests
let isRefreshing = false;
let failedQueue = [];

/**
 * Helper to process queued requests after token refresh
 */
function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Response interceptor: handles 401 errors and triggers token refresh
 * - Retries original request after refresh
 * - Logs out user on refresh failure
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // Dynamically import jwt-decode to avoid circular dependency
        const { jwtDecode } = await import('jwt-decode');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        // Call refresh endpoint
        const refreshRes = await api.post('/refresh-token', { refreshToken });
        const { token: newToken, refreshToken: newRefreshToken } = refreshRes.data?.data || refreshRes.data || {};
        if (newToken && newRefreshToken) {
          // Store new tokens
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          isRefreshing = false;
          processQueue(null, newToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return api(originalRequest);
        } else {
          throw new Error('No new token returned');
        }
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        // Log out user on refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 * @param {Object} data - Registration data (email, phoneNumber, firstName, ...)
 * @returns {Promise}
 */
export const register = async (data) => {
  return api.post('/register', data);
};

/**
 * Log in a user
 * @param {Object} data - Login data (email, password)
 * @returns {Promise}
 */
export const login = async (data) => {
  return api.post('/login', data);
};

/**
 * Refresh the access token using a refresh token
 * @param {string} refreshToken
 * @returns {Promise}
 */
export const refreshToken = async (refreshToken) => {
  return api.post('/refresh-token', { refreshToken });
};

export { api };

// Add more auth-related API calls as needed 