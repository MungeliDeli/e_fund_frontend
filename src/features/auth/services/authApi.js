import axios from 'axios';

// Set your backend base URL here
const API_BASE_URL = 'http://localhost:3000/api/v1/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Token injection
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

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle 401/403 globally here
    return Promise.reject(error);
  }
);

export const register = async (data) => {
  // data: { email, phoneNumber, firstName, ... }
  return api.post('/register', data);
};

export const login = async (data) => {
  // data: { email, password }
  return api.post('/login', data);
};

export { api };

// Add more auth-related API calls as needed 