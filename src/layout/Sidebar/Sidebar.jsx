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
} from "react-icons/fi";
import SidebarItem from "../../components/SidebarItem/SidebarItem";
import { useAuth } from "../../contexts/AuthContext";

// Public navigation items (always visible)
const publicNavItems = [
  { label: "Home", icon: FiHome, key: "home", path: "/" },
  { label: "Campaigns", icon: FiFlag, key: "campaigns", path: "/campaigns" },
  {
    label: "Notifications",
    icon: FiBell,
    key: "notifications",
    path: "/notifications",
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
      label: "Add Post",
      icon: FiPlusCircle,
      key: "add-post",
      path: "/add-post",
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
      label: "My Campaigns",
      icon: FiFlag,
      key: "my-campaigns",
      path: "/organizer/campaigns",
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
      label: "Metrics",
      icon: FiBarChart,
      key: "metrics",
      path: "/organizer/metrics",
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
  const userType = user?.userType;

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

  return (
    <>
      <div
        className={`fixed left-0 right-0 z-30 bg-black/40 transition-opacity lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } `}
        style={{ top: headerHeight }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed left-0  z-40 h-[calc(100vh-56px)] w-64 bg-[color:var(--color-background)] border-r border-[color:var(--color-muted)] flex flex-col pt-4 transition-transform \
                    lg:static lg:border-r lg:border-[color:var(--color-muted)]\
                    ${open ? "translate-x-0" : "-translate-x-full"} ${
          className || ""
        }  lg:translate-x-0`}
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
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
