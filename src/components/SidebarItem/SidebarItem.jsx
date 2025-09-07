import { NavLink } from "react-router-dom";

// SidebarItem.jsx
// This file defines the SidebarItem component for rendering individual navigation items in the sidebar.
// It displays icons, labels, and handles active states with consistent styling.

function SidebarItem({ icon: Icon, label, path }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center w-full px-4 py-2 rounded-md transition-colors text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] focus:outline-none mb-1 text-left ${
          isActive ? "bg-[color:var(--color-surface)] font-semibold" : ""
        }`
      }
      end
    >
      {Icon && (
        <Icon className={`mr-3 text-lg`} />
      )}
      <span className="text-sm">{label}</span>
    </NavLink>
  );
}

export default SidebarItem; 