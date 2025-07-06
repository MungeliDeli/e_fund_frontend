// MainLayout.jsx
// This file defines the MainLayout component, which provides the overall page structure for the app.
// It includes the Header, Sidebar, and main content area, and manages sidebar visibility and layout.
import { useState } from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import { useLocation } from "react-router-dom";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // It's generally better to manage active navigation item state using a router's active link
  // or a context for more complex apps, but for simplicity, useState is fine for this example.
  const [activeItem, setActiveItem] = useState("home"); 
  const location = useLocation();
  const hideSidebar = ["/signup", "/login"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-text)] transition-colors">
      
      
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        className={"fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 lg:px-40 "} 
      />

      {/* Sidebar only if not on signup/login */}
      {!hideSidebar && (
        <>
          <div className="hidden lg:block fixed top-14 left-0 h-[calc(100vh-58px)]  z-40">
            <Sidebar
              open={true} 
              onClose={() => {}} 
              activeItem={activeItem}
              onNav={(key) => setActiveItem(key)}
              className={`lg:pl-40  lg:w-84 `} 
            />
          </div>
          </>
      )}

          <div className="lg:hidden">
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              activeItem={activeItem}
              onNav={(key) => {
                setActiveItem(key);
                setSidebarOpen(false); 
              }}
              
            />
          </div>
       

      
      <main className={`mt-14 lg:ml-86  lg:mr-72 ${!hideSidebar && "md:mr-56"}  sm:px-4 max-w-6xl mx-auto`}>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;