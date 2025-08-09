// Header.jsx
// This file defines the Header component for the application's top navigation bar.
// It includes the logo, search bar, theme toggle, and authentication buttons.
import { FiMenu, FiBell, FiUser } from "react-icons/fi";
import { FaRegSun, FaRegMoon } from "react-icons/fa";
import SearchBar from "../../components/SearchBar/SearchBar";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import FundraiseLogo from "../../assets/Fundraise logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";

function Logo() {
  return (
    <span className="flex items-center">
      <img src={FundraiseLogo} alt="FundFlow Logo" className="w-7 h-7" />
      <span className="ml-2 font-bold text-xl text-[color:var(--color-primary)] hidden sm:inline">
        FundFlow
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
  const user = userProp || userCtx;
  const isAuthenticated =
    typeof isAuthenticatedProp === "boolean" ? isAuthenticatedProp : isAuthCtx;
  const isSignUp = location.pathname === "/signup";
  const isLogin = location.pathname === "/login";
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  // Organizer quick action
  const renderOrganizerActions = () => {
    if (user?.userType === "organization_user") {
      return (
        <button
          className="px-2 py-1 rounded bg-[color:var(--color-primary)] text-white font-medium text-xs sm:text-sm hover:bg-[color:var(--color-accent)] transition-colors mr-1"
          onClick={() => navigate("/organizer/create-campaign")}
        >
          Create Post
        </button>
      );
    }
    return null;
  };

  // Profile dropdown
  const renderProfileMenu = () => (
    <div
      className="absolute right-0 mt-2 w-56 bg-[color:var(--color-surface)]  rounded shadow-lg z-[9999]"
      style={{ display: profileOpen ? "block" : "none" }}
    >
      <button
        className="w-full text-left px-4 py-2 text-sm  flex items-center gap-2"
        onClick={() => {
          navigate("/profile-view");
          setProfileOpen(false);
        }}
      >
        <FiUser className="inline" /> View Profile
      </button>
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-xs">Theme:</span>
        <button
          className="p-1 rounded "
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {dark ? (
            <FaRegSun className="text-lg text-[color:var(--color-primary)]" />
          ) : (
            <FaRegMoon className="text-lg text-[color:var(--color-primary)]" />
          )}
        </button>
      </div>
      <button
        className="w-full text-left px-4 py-2 text-sm text-red-600"
        onClick={() => {
          logout();
          setProfileOpen(false);
        }}
      >
        Log Out
      </button>
    </div>
  );

  return (
    <header
      className={`w-full flex items-center gap-2 justify-between py-2 bg-[color:var(--color-background)] border-b border-[color:var(--color-muted)] relative ${className}`}
    >
      <button
        className="lg:hidden p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none shrink-0"
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
            {/* Notification icon */}
            <button
              className="p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none relative"
              aria-label="Notifications"
              onClick={() => navigate("/notifications")}
            >
              <FiBell className="text-xl text-[color:var(--color-primary-text)]" />
              {/* Badge dot for unread notifications */}
              <span className="absolute top-1 right-1 inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)] ring-2 ring-[color:var(--color-background)]" />
            </button>
            {/* Profile avatar */}
            <div className="relative" ref={profileRef}>
              <button
                className="w-9 h-9 rounded-full bg-[color:var(--color-muted)] flex items-center justify-center text-[color:var(--color-primary)] font-bold text-base focus:outline-none border border-[color:var(--color-muted)] hover:border-[color:var(--color-primary)]"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Profile menu"
              >
                {getInitials(user?.name, user?.email)}
              </button>
              {renderProfileMenu()}
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
                <FaRegSun className="text-xl text-[color:var(--color-primary)]" />
              ) : (
                <FaRegMoon className="text-xl text-[color:var(--color-primary)]" />
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
