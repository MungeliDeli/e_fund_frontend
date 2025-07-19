// MainLayout.jsx
// This file defines the MainLayout component, which provides the overall page structure for the app.
// It includes the Header, Sidebar, and main content area, and manages sidebar visibility and layout.
import { useState } from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();



  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-text)] transition-colors">
      <div className="fixed top-0 left-0 right-0 z-50 ">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        className={"fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 "} 
        user={user}
        isAuthenticated={isAuthenticated}
      />
      </div>
      {/* Sidebar for desktop */}
      <div className="hidden lg:block fixed top-14 left-0 h-[calc(100vh-58px)]  z-40">
        <Sidebar
          open={true}
          onClose={() => {}}
          user={user}
        />
      </div>
      {/* Sidebar for mobile */}
      <div className="lg:hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
      </div>
      <main className={`mt-14 lg:ml-60   sm:px-4 max-w-6xl mx-auto`}>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;