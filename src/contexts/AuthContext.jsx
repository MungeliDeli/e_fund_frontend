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
 * Wrap your app with <AuthProvider> to provide authentication context.
 * Use the useAuth() hook to access auth state and actions in any component.
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react"; // MODIFIED: Import useRef
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { refreshToken as refreshTokenApi } from "../features/auth/services/authApi";

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
  const location = useLocation();

  // ADDED: Ref to track if initializeAuth has already run for this component mount
  const hasInitialized = useRef(false);

  /**
   * On mount: Initialize authentication state.
   * Checks for tokens in localStorage, validates the access token, and attempts
   * to refresh the session if the access token is expired.
   */
  useEffect(() => {
    // MODIFIED: Only run initializeAuth if it hasn't run yet for this mount cycle
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true; // Mark as initialized

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (!storedToken || !storedRefreshToken) {
        // If on a public route (like /email-verified), don't force logout
        const publicRoutes = [
          "/",
          "/email-verified",
          "/template-preview",
          "/verify-email",
          "/signup",
          "/login",
          "/forgot-password",
          "/reset-password",
        ];
        const isPublicRoute =
          publicRoutes.includes(location.pathname) ||
          location.pathname.startsWith("/campaign/");
        if (isPublicRoute) {
          setLoading(false);
          return;
        }
        console.log(
          "No tokens found, ensuring user is logged out and stop loading."
        );
        logout();
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(storedToken);
        const isExpired = Date.now() >= decoded.exp * 1000;

        if (!isExpired) {
          // Token is valid, restore session from localStorage
          const storedUser = JSON.parse(localStorage.getItem("user"));
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Token is expired, attempt to refresh it

          const res = await refreshTokenApi(storedRefreshToken);

          const { token: newAccessToken, refreshToken: newRefreshToken } =
            res.data?.data || res.data || {};

          if (newAccessToken && newRefreshToken) {
            const newDecodedUser = jwtDecode(newAccessToken);
            const userData = {
              userId: newDecodedUser.userId,
              email: newDecodedUser.email,
              userType: newDecodedUser.userType,
            };
            login(userData, newAccessToken, newRefreshToken);
          } else {
            // Refresh failed, logout user
            throw new Error("Token refresh failed on load.");
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Dependencies remain empty, meaning it runs on mount

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
    setLoading(false);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /**
   * Log out the user and clear all session data
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /**
   * Refresh the access token using the refresh token
   * Handles token rotation and updates state/localStorage
   * Logs out user on refresh failure
   * @returns {Promise<string>} New access token
   */
  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken =
        refreshToken || localStorage.getItem("refreshToken");
      if (!storedRefreshToken) throw new Error("No refresh token");
      const res = await refreshTokenApi(storedRefreshToken);
      const { token: newAccessToken, refreshToken: newRefreshToken } =
        res.data?.data || res.data || {};
      if (newAccessToken && newRefreshToken) {
        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem("token", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        setIsAuthenticated(true);
        return newAccessToken;
      } else {
        throw new Error("No new token returned");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
