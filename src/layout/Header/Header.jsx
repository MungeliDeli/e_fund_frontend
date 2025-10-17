// Header.jsx
// This file defines the Header component for the application's top navigation bar.
// It includes the logo, search bar, theme toggle, and authentication buttons.
import { FiMenu, FiBell, FiSun, FiMoon } from "react-icons/fi";
import SearchBar from "../../components/SearchBar/SearchBar";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import FundraiseLogo from "../../assets/Fundraise logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeNotification } from "../../contexts/RealtimeNotificationContext";
import { useEffect, useRef, useState } from "react";
import ProfileImage from "../../features/users/components/ProfileImage";
import { useUserProfile } from "../../hooks/useUserProfile";

export function Logo() {
  return (
    <span className="flex items-center">
      <img src={FundraiseLogo} alt="FundFlow Logo" className="w-7 h-7" />
      <span className="ml-2 font-bold text-xl text-[color:var(--color-primary)] hidden sm:inline">
        Fundizo
      </span>
    </span>
  );
}

function getInitials(name, email) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

function Header({
  onMenuClick,
  className = "",
  user: userProp,
  isAuthenticated: isAuthenticatedProp,
}) {
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: userCtx, isAuthenticated: isAuthCtx, logout } = useAuth();
  const { unreadCount, handleNotificationsPageOpened } =
    useRealtimeNotification();
  const user = userProp || userCtx;
  const isAuthenticated =
    typeof isAuthenticatedProp === "boolean" ? isAuthenticatedProp : isAuthCtx;
  const isSignUp = location.pathname === "/signup";
  const isLogin = location.pathname === "/login";

  // Fetch user profile data for profile picture
  const { profile } = useUserProfile(user);

  // Handle notification click - mark all as read when navigating to notifications
  const handleNotificationClick = async () => {
    // Mark all notifications as read immediately when clicking the bell
    await handleNotificationsPageOpened();
    navigate("/notifications");
  };

  // Organizer quick action
  const renderOrganizerActions = () => {
    if (user?.userType === "organizationUser") {
      return (
        <button
          className="px-2 py-1 rounded bg-[color:var(--color-primary)] text-white font-medium text-xs sm:text-sm hover:bg-[color:var(--color-accent)] transition-colors mr-1"
          onClick={() => navigate("/feed/create")}
        >
          Create Post
        </button>
      );
    }
    return null;
  };

  return (
    <header
      className={`w-full flex items-center gap-2 justify-between py-2 bg-[color:var(--color-background)] border-b border-[color:var(--color-muted)] relative ${className}`}
    >
      <button
        className="xl:hidden p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none shrink-0"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <FiMenu className="text-2xl text-[color:var(--color-primary-text)]" />
      </button>
      <div className="flex items-center mr-1 shrink-0">
        <Logo />
      </div>
      <div className="flex-1 flex justify-center min-w-0 mx-1">
        <SearchBar className="w-full max-w-lg" />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isAuthenticated ? (
          <>
            {renderOrganizerActions()}
            {/* Theme toggle */}
            <button
              className="p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? (
                <FiSun className="text-xl text-[color:var(--color-primary)]" />
              ) : (
                <FiMoon className="text-xl text-[color:var(--color-primary)]" />
              )}
            </button>
            {/* Notification icon */}
            <button
              className="p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none relative"
              aria-label="Notifications"
              onClick={handleNotificationClick}
            >
              <FiBell className="text-xl text-[color:var(--color-primary-text)]" />
              {/* Badge dot for unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)] ring-2 ring-[color:var(--color-background)]" />
              )}
            </button>
            {/* Profile avatar - display only */}
            <div className="w-9 h-9 rounded-full border border-[color:var(--color-muted)] overflow-hidden">
              {profile?.profilePictureUrl ? (
                <ProfileImage
                  imageUrl={profile.profilePictureUrl}
                  size="sm"
                  alt="Profile"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-[color:var(--color-muted)] flex items-center justify-center text-[color:var(--color-primary)] font-bold text-base">
                  {getInitials(user?.name, user?.email)}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              className="p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? (
                <FiSun className="text-xl text-[color:var(--color-primary)]" />
              ) : (
                <FiMoon className="text-xl text-[color:var(--color-primary)]" />
              )}
            </button>
            {!isLogin && (
              <button
                className="px-2 py-1 rounded border border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-medium text-xs sm:text-sm hover:bg-[color:var(--color-muted)] transition-colors"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            )}
            {!isSignUp && (
              <button
                className="px-2 py-1 rounded bg-[color:var(--color-primary)] text-white font-medium text-xs sm:text-sm hover:bg-[color:var(--color-accent)] transition-colors"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
