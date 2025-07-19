/**
 * AuthContext & AuthProvider
 *
 * Provides authentication state and logic for the entire application using React Context.
 * Handles login, logout, token/session management, and automatic token refresh.
 *
 * Key Features:
 * - Centralized authentication state (user, token, refreshToken, isAuthenticated)
 * - Persistent session using localStorage
 * - Automatic JWT expiry check on app load
 * - Token refresh logic with error handling
 * - Login/logout helpers for use throughout the app
 *
 * Usage:
 *   Wrap your app with <AuthProvider> to provide authentication context.
 *   Use the useAuth() hook to access auth state and actions in any component.
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { refreshToken as refreshTokenApi } from '../features/auth/services/authApi';

const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Wraps the app and provides authentication state and actions
 */
export const AuthProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate(); 

  /**
   * On mount: Check for existing session in localStorage and validate JWT expiry
   * If valid, restore session; otherwise, clear all auth data
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    let tokenValid = false;
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp && Date.now() < decoded.exp * 1000) {
          tokenValid = true;
        }
      } catch (e) {
        tokenValid = false;
      }
    }

    if (storedToken && storedRefreshToken && storedUser && tokenValid) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  /**
   * Log in a user and persist session to localStorage
   * @param {Object} userData - User profile data
   * @param {string} accessToken - JWT access token
   * @param {string} refresh - Refresh token
   */
  const login = (userData, accessToken, refresh) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(refresh);
    setIsAuthenticated(true);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Log out the user and clear all session data
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  /**
   * Refresh the access token using the refresh token
   * Handles token rotation and updates state/localStorage
   * Logs out user on refresh failure
   * @returns {Promise<string>} New access token
   */
  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken = refreshToken || localStorage.getItem('refreshToken');
      if (!storedRefreshToken) throw new Error('No refresh token');
      const res = await refreshTokenApi(storedRefreshToken);
      const { token: newAccessToken, refreshToken: newRefreshToken } = res.data?.data || res.data || {};
      if (newAccessToken && newRefreshToken) {
        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setIsAuthenticated(true);
        return newAccessToken;
      } else {
        throw new Error('No new token returned');
      }
    } catch (err) {
      logout();
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook
 * Provides access to authentication state and actions
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 