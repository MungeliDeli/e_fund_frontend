/**
 * UserProfilePage Component
 * 
 * The main profile page component that handles both public and private profile views.
 * This component manages profile data fetching, tab navigation, image display,
 * and provides a unified interface for viewing and editing user profiles.
 * 
 * Key Features:
 * - Dual view modes: Public (anyone) and Private (owner only)
 * - Tab-based navigation with URL synchronization
 * - Profile and cover image display with editing capabilities
 * - Responsive design with mobile optimization
 * - Deep linking support for direct tab access
 * - Optimized rendering to prevent flicker on tab switches
 * 
 * Route Behavior:
 * - /profile-view - Shows current user's private profile
 * - /users/:userId - Shows public profile of specified user
 * - Automatic redirect if user views their own public profile
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import React, { useMemo , useEffect, useState} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OverviewTab from "./tabs/OverviewTab";
import DonationsTab from "./tabs/DonationsTab";
import CampaignsTab from "./tabs/CampaignsTab";
import MessagesTab from "./tabs/MessagesTab";
import AccountSettingsTab from "./tabs/AccountSettingsTab";
import { FiCamera } from "react-icons/fi";
import { fetchPublicProfile, fetchPrivateProfile } from "../../services/usersApi";
import ProfileImage from "../../components/ProfileImage";
import CoverImage from "../../components/CoverImage";

/**
 * UserProfilePage
 * Renders either the owner's private profile or a public profile view,
 * depending on the route and logged-in user.
 */
function UserProfilePage() {
  // Route and navigation state
  const { userId } = useParams(); // userId from URL params (undefined for /profile-view)
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Determine if the current viewer is the profile owner
  const isOwner = !userId || userId === loggedInUser?.userId;

  // Tab configuration mapping for URL synchronization
  const tabMap = {
    overview: 0,
    donations: 1,
    campaigns: 2,
    messages: 3,
    "account-settings": isOwner ? 4 : undefined, // Only show for owners
  };

  // Extract tab from URL query parameters for deep linking
  const params = new URLSearchParams(location.search);
  const tabParam = params.get("tab");
  const initialTab = tabParam && tabMap[tabParam] !== undefined ? tabMap[tabParam] : 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  /**
   * Synchronize tab state with URL changes
   * This ensures the active tab stays in sync when URL is manually changed
   */
  useEffect(() => {
    if (tabParam && tabMap[tabParam] !== undefined && tabMap[tabParam] !== activeTab) {
      setActiveTab(tabMap[tabParam]);
    }
    // eslint-disable-next-line
  }, [tabParam, isOwner]);

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userProfile', userId, isOwner],
    queryFn: async () => {
      const res = isOwner ? await fetchPrivateProfile() : await fetchPublicProfile(userId);
      return res.data || res; // Handle responses that might be wrapped in a data object
    },
    // The query will automatically refetch if userId or isOwner changes
  });

  
  /**
   * Redirect logic: If user tries to view their own public profile,
   * redirect them to their private profile view
   */
  useEffect(() => {
    if (userId && userId === loggedInUser?.userId) {
      navigate("/profile-view", { replace: true });
    }
    
  }, [userId, loggedInUser, navigate]);

  /**
   * Memoized tab configuration to prevent unnecessary re-renders
   * Only recreates when profile, isOwner, or setProfile changes
   */
  const tabConfigs = useMemo(() => (
    isOwner
      ? [
          { label: "Overview", key: "overview" },
          { label: "Donations", key: "donations" },
          { label: "Campaigns", key: "campaigns" },
          { label: "Messages", key: "messages" },
          { label: "Account Settings", key: "account-settings" },
        ]
      : [
          { label: "Overview", key: "overview" },
          { label: "Donations", key: "donations" },
          { label: "Campaigns", key: "campaigns" },
        ]
  ), [isOwner]);

  // Add goToAccountSettings function
  const goToAccountSettings = () => {
    setActiveTab(tabConfigs.length - 1);
    window.history.replaceState(null, '', '/profile-view?tab=account-settings');
  };

  /**
   * Render tab content based on active tab index
   * This approach prevents unnecessary re-renders of tab components
   */
  const renderTabContent = () => {
    if (!profile) return null;
  
    switch (activeTab) {
      case 0: // Overview
        return <OverviewTab profile={profile} isOwner={isOwner} goToAccountSettings={goToAccountSettings} />;
      case 1: // Donations
        return <DonationsTab />;
      case 2: // Campaigns
        return <CampaignsTab />;
      case 3: // Messages
        return isOwner ? <MessagesTab /> : null;
      case 4: // Account Settings
        return isOwner ? <AccountSettingsTab profile={profile} onProfileUpdate={() => queryClient.invalidateQueries({ queryKey: ['userProfile', userId, isOwner] })} /> : null;
      default:
        return <OverviewTab profile={profile} isOwner={isOwner} goToAccountSettings={goToAccountSettings} />;
    }
  };

  /**
   * Handle tab switching with URL synchronization
   * Updates both local state and URL without triggering navigation
   */
  const handleTabClick = (idx) => {
    setActiveTab(idx);
    // Update URL with tab param for deep linking without triggering navigation
    const tabNames = Object.keys(tabMap);
    const tabName = tabNames.find((key) => tabMap[key] === idx);
    if (tabName) {
      // Use window.history to update URL without triggering navigation
      const newUrl = `/profile-view?tab=${tabName}`;
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.replaceState(null, '', '/profile-view');
    }
  };

  // Show loading state only when actually loading profile data
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-[color:var(--color-background)] min-h-[80vh]">
        <div className="text-[color:var(--color-text)]">Loading profile...</div>
      </div>
    );
  }

  // Error and empty states
  if (isError) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-[color:var(--color-background)] min-h-[80vh] text-center p-4">
        <h2 className="text-2xl font-semibold text-red-500 mb-4">Failed to Load Profile</h2>
        <p className="text-[color:var(--color-text-muted)] mb-6 max-w-md">
          {error.response?.data?.message || error.message || 'An unexpected error occurred. The profile could not be loaded. Please check your connection and try again.'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!profile) return <div>No profile found.</div>;

  return (
    <div className="w-full flex flex-col items-center bg-[color:var(--color-background)] min-h-[80vh]">
      {/* Cover Photo Section */}
      <div className="w-full max-w-4xl relative rounded-b-lg overflow-hidden">
        <CoverImage 
          mediaId={profile?.coverPictureMediaId}
          height="h-36 sm:h-44 md:h-52 lg:h-60"
          alt="Cover"
        />
        {/* Edit button only for owner */}
        {isOwner && (
          <button
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
            onClick={() => handleTabClick(tabConfigs.length - 1)} // Go to Account Settings tab
            aria-label="Edit cover photo"
          >
            <FiCamera className="text-xl text-gray-700" />
          </button>
        )}
      </div>

      {/* Profile Photo Section */}
      <div className="relative -mt-14 sm:-mt-16 mb-2">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-1 border-[color:var(--color-background)] shadow-lg">
          <ProfileImage 
            mediaId={profile?.profilePictureMediaId}
            size="2xl"
            alt="Profile"
            className="w-full h-full"
          />
        </div>
        {/* Edit button only for owner */}
        {isOwner && (
          <button
            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
            onClick={() => handleTabClick(tabConfigs.length - 1)} // Go to Account Settings tab
            aria-label="Edit profile photo"
          >
            <FiCamera className="text-lg text-gray-700" />
          </button>
        )}
      </div>

      {/* User Name Display */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-center px-2 break-words">
        {profile.firstName} {profile.lastName || ""}
      </h2>

      {/* Tab Navigation */}
      <div className="flex flex-row gap-2 sm:gap-6 border-b w-full border-[color:var(--color-muted)] max-w-3xl justify-start sm:justify-center mt-2 overflow-x-auto hide-scrollbar py-2 px-2 sm:px-0">
        {tabConfigs.map((tab, idx) => (
          <button
            key={tab.key}
            className={`py-3 px-2 text-[color:var(--color-text)] sm:px-1 text-sm sm:text-base font-medium border-b-2 transition-colors duration-150 whitespace-nowrap ${
              idx === activeTab
                ? "border-[color:var(--color-primary)]"
                : "border-transparent  hover:text-[color:var(--color-primary)]"
            }`}
            onClick={() => handleTabClick(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="w-full max-w-3xl min-h-[200px] mt-6 px-2 py-2 sm:px-0">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default UserProfilePage; 