/**
 * OrganizerProfilePage Component
 *
 * The main profile page component for organizers.
 * This component displays organizer information in a beautiful format
 * with cover photo, profile picture, verification status, and tabbed content.
 * Supports both public and private profile views.
 *
 * Key Features:
 * - Dual view modes: Public (anyone) and Private (owner only)
 * - Cover photo and profile picture display
 * - Organization name with short name in brackets
 * - Verification status with green marker
 * - Organization details (date joined, type, website)
 * - Tab-based navigation (About, Campaigns, Posts)
 * - Responsive design with mobile optimization
 * - Deep linking support for direct tab access
 *
 * Route Behavior:
 * - /organizers/:organizerId - Shows public profile of specified organizer
 * - /organizer/profile - Shows current organizer's private profile
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import { useParams, useLocation } from "react-router-dom";
import React, { useMemo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiCheckCircle, FiGlobe, FiCalendar, FiUsers } from "react-icons/fi";
import {
  fetchOrganizerById,
  fetchPrivateOrganizationProfile,
} from "../../services/usersApi";
import ProfileImage from "../../components/ProfileImage";
import CoverImage from "../../components/CoverImage";
import AboutTab from "./tabs/AboutTab";
import CampaignsTab from "./tabs/CampaignsTab";
import PostsTab from "./tabs/PostsTab";

/**
 * OrganizerProfilePage
 * Renders either the public profile view for any organizer or the private profile view
 * for the current organizer, with all information displayed.
 */
function OrganizerProfilePage() {
  // Route state
  const { organizerId } = useParams();
  const location = useLocation();

  // Tab configuration mapping for URL synchronization
  const tabMap = {
    about: 0,
    campaigns: 1,
    posts: 2,
  };

  // Extract tab from URL query parameters for deep linking
  const params = new URLSearchParams(location.search);
  const tabParam = params.get("tab");
  const initialTab =
    tabParam && tabMap[tabParam] !== undefined ? tabMap[tabParam] : 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  /**
   * Synchronize tab state with URL changes
   * This ensures the active tab stays in sync when URL is manually changed
   */
  useEffect(() => {
    if (
      tabParam &&
      tabMap[tabParam] !== undefined &&
      tabMap[tabParam] !== activeTab
    ) {
      setActiveTab(tabMap[tabParam]);
    }
    // eslint-disable-next-line
  }, [tabParam]);

  // Determine if this is a public profile view or private profile view
  const isPublicView = !!organizerId;

  const {
    data: organizer,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organizerProfile", organizerId, isPublicView],
    queryFn: async () => {
      const res = await fetchPrivateOrganizationProfile();

      return res.data || res;
    },
    enabled: true, // Always run query
  });

  /**
   * Memoized tab configuration
   */
  const tabConfigs = useMemo(
    () => [
      { label: "About", key: "about" },
      { label: "Campaigns", key: "campaigns" },
      { label: "Posts", key: "posts" },
    ],
    []
  );

  /**
   * Render tab content based on active tab index
   */
  const renderTabContent = () => {
    if (!organizer) return null;

    switch (activeTab) {
      case 0: // About
        return <AboutTab organizer={organizer} />;
      case 1: // Campaigns
        return <CampaignsTab organizerId={organizerId} />;
      case 2: // Posts
        return <PostsTab organizerId={organizerId} />;
      default:
        return <AboutTab organizer={organizer} />;
    }
  };

  /**
   * Handle tab switching with URL synchronization
   */
  const handleTabClick = (idx) => {
    setActiveTab(idx);
    // Update URL with tab param for deep linking without triggering navigation
    const tabNames = Object.keys(tabMap);
    const tabName = tabNames.find((key) => tabMap[key] === idx);
    if (tabName) {
      const baseUrl = isPublicView
        ? `/organizers/${organizerId}`
        : `/organizer/profile`;
      const newUrl = `${baseUrl}?tab=${tabName}`;
      window.history.replaceState(null, "", newUrl);
    } else {
      const baseUrl = isPublicView
        ? `/organizers/${organizerId}`
        : `/organizer/profile`;
      window.history.replaceState(null, "", baseUrl);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-[color:var(--color-background)] min-h-[80vh]">
        <div className="text-[color:var(--color-text)]">
          Loading organizer profile...
        </div>
      </div>
    );
  }

  // Error and empty states
  if (isError) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-[color:var(--color-background)] min-h-[80vh] text-center p-4">
        <h2 className="text-2xl font-semibold text-red-500 mb-4">
          Failed to Load Profile
        </h2>
        <p className="text-[color:var(--color-text-muted)] mb-6 max-w-md">
          {error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred. The organizer profile could not be loaded. Please check your connection and try again."}
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

  if (!organizer) return <div>No organizer found.</div>;

  return (
    <div className="w-full flex flex-col items-center bg-[color:var(--color-background)] min-h-[80vh]">
      {/* Cover Photo Section */}
      <div className="w-full max-w-4xl relative rounded-b-lg overflow-hidden">
        <CoverImage
          imageUrl={organizer?.coverPictureUrl}
          height="h-36 sm:h-44 md:h-52 lg:h-60"
          alt="Cover"
        />
      </div>

      {/* Profile Photo Section */}
      <div className="relative -mt-14 sm:-mt-16 mb-2">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[color:var(--color-background)] shadow-lg">
          <ProfileImage
            imageUrl={organizer?.profilePictureUrl}
            size="2xl"
            alt="Profile"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Organization Name with Short Name and Verification */}
      <div className="flex flex-col items-center ">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-center  break-words">
            {organizer.organizationName}
            {organizer.organizationShortName && (
              <span className="text-[color:var(--color-secondary-text)] font-normal">
                {" "}
                ({organizer.organizationShortName})
              </span>
            )}
          </h2>
          {organizer.isEmailVerified && (
            <FiCheckCircle className="w-4 h-4 text-[color:var(--color-primary)] flex-shrink-0" />
          )}
        </div>

        {/* Organization Details */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[color:var(--color-secondary-text)] mb-4">
          {organizer.createdAt && (
            <div className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              <span>
                Joined{" "}
                {new Date(organizer.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {organizer.organizationType && (
            <div className="flex items-center gap-1">
              <FiUsers className="w-4 h-4" />
              <span>{organizer.organizationType}</span>
            </div>
          )}
          {organizer.officialWebsiteUrl && (
            <div className="flex items-center gap-1">
              <FiGlobe className="w-4 h-4" />
              <a
                href={organizer.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--color-primary)] hover:underline"
              >
                Website
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-row gap-2 sm:gap-6 border-b w-full border-[color:var(--color-muted)] max-w-3xl justify-start sm:justify-center mt-2 overflow-x-auto hide-scrollbar py-2 px-2 sm:px-0">
        {tabConfigs.map((tab, idx) => (
          <button
            key={tab.key}
            className={`py-3 px-2 text-[color:var(--color-text)] sm:px-1 text-sm sm:text-base font-medium border-b-2 transition-colors duration-150 whitespace-nowrap ${
              idx === activeTab
                ? "border-[color:var(--color-primary)]"
                : "border-transparent hover:text-[color:var(--color-primary)]"
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

export default OrganizerProfilePage;
