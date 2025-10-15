import {
  FiHome,
  FiFlag,
  FiCalendar,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiUserPlus,
  FiSearch,
  FiPlusCircle,
  FiUser,
  FiBarChart,
  FiX,
  FiBriefcase,
  FiBell,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";
import SidebarItem from "../../components/SidebarItem/SidebarItem";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeNotification } from "../../contexts/RealtimeNotificationContext";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTopOrganizers,
  fetchTopCampaigns,
  getPublicMediaUrl,
} from "../../services/apiClient";

// Public navigation items (always visible)
const publicNavItems = [
  { label: "Home", icon: FiHome, key: "home", path: "/" },
  {
    label: "Campaigns",
    icon: FiFlag,
    key: "campaigns",
    path: "/feed?tab=campaigns",
  },
];

// Role-based navigation config
const adminNavItems = [
  {
    label: "Admin Dashboard",
    icon: FiHome,
    key: "admin-dashboard",
    path: "/admin/dashboard",
  },
  {
    label: "Organizers",
    icon: FiBriefcase,
    key: "admin-organizers",
    path: "/admin/organizers",
    allowedRoles: ["superAdmin", "supportAdmin"],
  },
  {
    label: "User Management",
    icon: FiUsers,
    key: "admin-users",
    path: "/admin/users",
    allowedRoles: ["superAdmin", "supportAdmin"],
  },
  {
    label: "Campaign",
    icon: FiFlag,
    key: "admin-campaigns",
    path: "/admin/campaigns",
    allowedRoles: ["superAdmin", "eventModerator"],
  },
  {
    label: "Donations",
    icon: FiBarChart,
    key: "admin-donations",
    path: "/donations",
    allowedRoles: [
      "superAdmin",
      "supportAdmin",
      "eventModerator",
      "financialAdmin",
    ],
  },
  {
    label: "Withdrawals",
    icon: FiDollarSign,
    key: "admin-withdrawals",
    path: "/admin/withdrawals",
    allowedRoles: ["superAdmin", "financialAdmin"],
  },
  {
    label: "Transactions",
    icon: FiCreditCard,
    key: "admin-transactions",
    path: "/admin/transactions",
    allowedRoles: [
      "superAdmin",
      "supportAdmin",
      "eventModerator",
      "financialAdmin",
    ],
  },

  {
    label: "Audit Logs",
    icon: FiSearch,
    key: "admin-audit-logs",
    path: "/admin/audit-logs",
    allowedRoles: [
      "superAdmin",
      "supportAdmin",
      "eventModerator",
      "financialAdmin",
    ],
  },
  {
    label: "Financial Reports",
    icon: FiBarChart2,
    key: "admin-financial",
    path: "/admin/financial-reports",
    allowedRoles: ["superAdmin", "financialAdmin"],
  },
  {
    label: "Settings",
    icon: FiSettings,
    key: "admin-settings",
    path: "/admin/settings",
    allowedRoles: ["superAdmin"],
  },
];

const navConfig = {
  individualUser: [
    {
      label: "Notifications",
      icon: FiBell,
      key: "notifications",
      path: "/notifications",
    },
    {
      label: "Profile",
      icon: FiUser,
      key: "profile-view",
      path: "/profile-view",
    },
  ],
  organizationUser: [
    {
      label: "Dashboard",
      icon: FiHome,
      key: "organizer-dashboard",
      path: "/organizer/dashboard",
    },
    {
      label: "Profile",
      icon: FiUser,
      key: "organizer-profile",
      path: "/organizer/profile",
    },
    {
      label: "Notifications",
      icon: FiBell,
      key: "notifications",
      path: "/notifications",
    },
    {
      label: "My Campaigns",
      icon: FiFlag,
      key: "my-campaigns",
      path: "/organizer/campaigns",
    },
    {
      label: "My Donations",
      icon: FiBarChart,
      key: "my-donations",
      path: "/donations",
    },
    {
      label: "My Contacts",
      icon: FiUsers,
      key: "my-contacts",
      path: "/organizer/contacts",
    },
    {
      label: "Create Campaign",
      icon: FiPlusCircle,
      key: "create-campaign",
      path: "/organizer/campaigns/create",
    },
    {
      label: "Create Post",
      icon: FiPlusCircle,
      key: "create-post",
      path: "/feed/create",
    },

    {
      label: "Outreach Analytics",
      icon: FiBarChart2,
      key: "organizer-outreach-analytics",
      path: "/organizer/outreach/analytics",
    },
    {
      label: "My Withdrawals",
      icon: FiDollarSign,
      key: "organizer-withdrawals",
      path: "/organizer/withdrawals",
    },
    {
      label: "Settings",
      icon: FiSettings,
      key: "organizer-settings",
      path: "/organizer/settings",
    },
  ],
  admin: adminNavItems,
};

const adminRoles = [
  "superAdmin",
  "supportAdmin",
  "eventModerator",
  "financialAdmin",
];

function Sidebar({ open, onClose, className }) {
  const headerHeight = 56;
  const { user, isAuthenticated } = useAuth();
  const { unreadCount, handleNotificationsPageOpened } =
    useRealtimeNotification();
  const userType = user?.userType;
  const navigate = useNavigate();
  const [showOrganizers, setShowOrganizers] = useState(true);
  const [topOrganizers, setTopOrganizers] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(true);
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  let roleNavItems = [];
  if (isAuthenticated && userType) {
    if (adminRoles.includes(userType)) {
      roleNavItems = navConfig.admin.filter(
        (item) =>
          !item.allowedRoles ||
          item.allowedRoles.includes(userType) ||
          userType === "superAdmin"
      );
    } else {
      roleNavItems = navConfig[userType] || [];
    }
  }

  useEffect(() => {
    let mounted = true;
    const loadLeaders = async () => {
      try {
        setLoadingLeaders(true);
        const data = await fetchTopOrganizers(5);
        if (mounted) setTopOrganizers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setTopOrganizers([]);
      } finally {
        if (mounted) setLoadingLeaders(false);
      }
    };
    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true);
        const data = await fetchTopCampaigns(5);
        if (mounted) setTopCampaigns(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setTopCampaigns([]);
      } finally {
        if (mounted) setLoadingCampaigns(false);
      }
    };
    loadLeaders();
    loadCampaigns();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div
        className={`fixed left-0 right-0 z-30 bg-black/40 transition-opacity xl:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } `}
        style={{ top: headerHeight }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed left-0 z-40 h-[calc(100vh-56px)] w-64 bg-[color:var(--color-background)] border-r border-[color:var(--color-muted)] flex flex-col pt-4 transition-transform overflow-y-auto sidebar-scroll \
                    xl:static xl:border-r xl:border-[color:var(--color-muted)]\
                    ${open ? "translate-x-0" : "-translate-x-full"} ${
          className || ""
        } xl:translate-x-0`}
        style={{ top: headerHeight }}
        aria-label="Sidebar"
      >
        <nav className={"flex-1 flex flex-col gap-1 px-3"}>
          {/* Public nav items */}
          {publicNavItems.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              path={item.path}
            />
          ))}
          {/* Divider if there are role-based items */}
          {roleNavItems.length > 0 && (
            <div className="my-2 border-t border-[color:var(--color-muted)]" />
          )}
          {/* Role-based nav items */}
          {roleNavItems.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              path={item.path}
              onClick={
                item.key === "notifications"
                  ? async () => await handleNotificationsPageOpened()
                  : undefined
              }
            />
          ))}

          {/* Divider for leaderboards */}
          <div className="my-2 border-t border-[color:var(--color-muted)]" />

          {/* Organizers leaderboard header */}
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[color:var(--color-surface)] hover:bg-[color:var(--color-muted)] transition-colors"
            onClick={() => setShowOrganizers((v) => !v)}
            aria-expanded={showOrganizers}
          >
            <span className="text-xs font-semibold tracking-wide text-[color:var(--color-secondary-text)]">
              TOP ORGANIZERS
            </span>
            <svg
              className={`w-4 h-4 text-[color:var(--color-secondary-text)] transition-transform ${
                showOrganizers ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Organizers list */}
          {showOrganizers && (
            <div className="mt-2 flex flex-col gap-2">
              {loadingLeaders && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-[color:var(--color-muted)] animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="h-3 w-24 bg-[color:var(--color-muted)] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </>
              )}
              {!loadingLeaders &&
                topOrganizers.map((org) => (
                  <button
                    key={org.organizerId}
                    type="button"
                    onClick={() => navigate(`/organizers/${org.organizerId}`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[color:var(--color-muted)] transition-colors text-left"
                  >
                    {org.profilePictureUrl ? (
                      <img
                        src={org.profilePictureUrl}
                        alt={org.organizationShortName || org.organizationName}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[color:var(--color-primary)] text-white text-xs flex items-center justify-center">
                        {(
                          org.organizationShortName ||
                          org.organizationName ||
                          ""
                        ).slice(0, 1)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[color:var(--color-text)] truncate">
                        {org.organizationShortName || org.organizationName}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {/* Divider below organizers */}
          <div className="my-2 border-t border-[color:var(--color-muted)]" />

          {/* Campaigns leaderboard header */}
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[color:var(--color-surface)] hover:bg-[color:var(--color-muted)] transition-colors"
            onClick={() => setShowCampaigns((v) => !v)}
            aria-expanded={showCampaigns}
          >
            <span className="text-xs font-semibold tracking-wide text-[color:var(--color-secondary-text)]">
              POPULAR CAMPAIGNS
            </span>
            <svg
              className={`w-4 h-4 text-[color:var(--color-secondary-text)] transition-transform ${
                showCampaigns ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Campaigns list */}
          {showCampaigns && (
            <div className="mt-2 flex flex-col gap-2">
              {loadingCampaigns && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-[color:var(--color-muted)] animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="h-3 w-28 bg-[color:var(--color-muted)] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </>
              )}
              {!loadingCampaigns &&
                topCampaigns.map((c) => {
                  const firstLetter = (c.campaignTitle || "").slice(0, 1);
                  const isVideo =
                    (c.mainMediaType || "").toLowerCase() === "video";
                  const mediaUrl = !isVideo ? c.mainMediaUrl : null;
                  const href = c.campaignShareLink
                    ? `/campaign/${c.campaignShareLink}-${(
                        c.campaignTitle || ""
                      )
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")
                        .slice(0, 80)}`
                    : "#";
                  return (
                    <button
                      key={c.campaignId}
                      type="button"
                      onClick={() => href && navigate(href)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[color:var(--color-muted)] transition-colors text-left"
                    >
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={c.campaignTitle}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[color:var(--color-primary)] text-white text-xs flex items-center justify-center">
                          {firstLetter}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[color:var(--color-text)] truncate">
                          {c.campaignTitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </nav>
      </aside>
      <style>{`
        /* Hide scrollbar for WebKit-based browsers */
        .sidebar-scroll::-webkit-scrollbar { display: none; }
        /* Hide scrollbar for Firefox */
        .sidebar-scroll { scrollbar-width: none; }
        /* Hide scrollbar for IE and Edge (legacy) */
        .sidebar-scroll { -ms-overflow-style: none; }
      `}</style>
    </>
  );
}

export default Sidebar;
