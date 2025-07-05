import { FiHome, FiFlag, FiCalendar, FiBarChart2, FiX } from "react-icons/fi";
import SidebarItem from "../../components/SidebarItem/SidebarItem";

const navItems = [
  { label: "Home", icon: FiHome, key: "home" },
  { label: "Campaign", icon: FiFlag, key: "campaign" },
  { label: "Event", icon: FiCalendar, key: "event" },
  { label: "Leader Board", icon: FiBarChart2, key: "leaderboard" },
];


function Sidebar({ open, onClose, activeItem, onNav, className }) { 
  const headerHeight = 56;

  return (
    <>
      <div
        className={`fixed left-0 right-0 z-30 bg-black/40 transition-opacity lg:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} `}
        style={{ top: headerHeight }}
        onClick={onClose}
        aria-hidden={!open}
      />

    
      <aside
        className={`fixed left-0  z-40 h-[calc(100vh-56px)] w-64 bg-[color:var(--color-background)] border-r border-[color:var(--color-muted)] flex flex-col pt-4 transition-transform 
                    lg:static lg:border-r lg:border-[color:var(--color-muted)]
                    ${open ? "translate-x-0" : "-translate-x-full"} ${className || ''}  lg:translate-x-0`}
        style={{ top: headerHeight }}
        aria-label="Sidebar"
      >
        
        <nav className={"flex-1 flex flex-col gap-1 px-3"}> 
          {navItems.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.key}
              onClick={() => onNav?.(item.key)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;