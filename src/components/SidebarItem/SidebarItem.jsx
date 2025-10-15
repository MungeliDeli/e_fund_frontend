import { NavLink } from "react-router-dom";

// SidebarItem.jsx
// This file defines the SidebarItem component for rendering individual navigation items in the sidebar.
// It displays icons, labels, and handles active states with consistent styling.

function SidebarItem({ icon: Icon, label, path, badge, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <NavLink
      to={path}
      onClick={handleClick}
      className={({ isActive }) =>
        `flex items-center w-full px-4 py-2 rounded-md transition-colors text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] focus:outline-none mb-1 text-left ${
          isActive ? "bg-[color:var(--color-surface)] font-semibold" : ""
        }`
      }
      end
    >
      {Icon && <Icon className={`mr-3 text-lg`} />}
      <span className="text-sm flex-1">{label}</span>
      {badge && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-accent)] text-white min-w-[1.25rem] h-5">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}

export default SidebarItem;
