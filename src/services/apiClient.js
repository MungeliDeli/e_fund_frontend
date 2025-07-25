/**
 * Centralized API Client (Axios Instance)
 *
 * This module exports a single, configured Axios instance with interceptors for
 * authentication, token injection, and automatic token refresh.
 * All other API service modules in the application should import and use this
 * instance to ensure consistent behavior.
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for token injection
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Token Refresh Logic ---
let isRefreshing = false;
let failedQueue = [];

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

// Response interceptor for handling 401 errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Axios interceptor caught an error:', error.response?.status, error.config.url);
    // Skip interceptor for refresh token calls
    if (originalRequest.skipAuthInterceptor) {
      return Promise.reject(error);
    }
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('Caught 401 error. Attempting to refresh token.');

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log('Setting isRefreshing to true and starting refresh process.');

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error('No refresh token found in localStorage.');
          throw new Error('No refresh token');
        }

        console.log('Calling /auth/refresh-token endpoint...');
        const refreshRes = await apiClient.post('/auth/refresh-token', { refreshToken });
        console.log('Successfully refreshed token.');

        const { token: newToken, refreshToken: newRefreshToken } = refreshRes.data?.data || refreshRes.data || {};

        if (newToken && newRefreshToken) {
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          processQueue(null, newToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return apiClient(originalRequest);
        } else {
          throw new Error('No new token returned');
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        processQueue(refreshError, null);
        console.log('Dispatching logout event due to refresh failure.');
        window.dispatchEvent(new Event('logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
