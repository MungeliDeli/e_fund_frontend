// SidebarItem.jsx
// This file defines the SidebarItem component for rendering individual navigation items in the sidebar.
// It displays icons, labels, and handles active states with consistent styling.

function SidebarItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      className={`flex items-center w-full px-4 py-2 rounded-md transition-colors text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] focus:outline-none  mb-1 text-left ${
        active ? "bg-[color:var(--color-surface)] font-semibold" : ""
      }`}
      onClick={onClick}
    >
      {Icon && (
        <Icon className={`mr-3 text-lg ${active ? "text-[color:var(--color-primary)]" : "text-[color:var(--color-secondary-text)]"}`} />
      )}
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default SidebarItem; 