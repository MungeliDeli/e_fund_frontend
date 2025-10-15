import React, { useState } from "react";
import { FiUsers, FiUserCheck, FiShield } from "react-icons/fi";
import UsersTab from "./tabs/UsersTab";
import OrganizersTab from "./tabs/OrganizersTab";
import AdminsTab from "./tabs/AdminsTab";

function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    {
      id: "users",
      label: "Users",
      icon: FiUsers,
    },
    {
      id: "organizers",
      label: "Organizers",
      icon: FiUserCheck,
    },
    {
      id: "admins",
      label: "Admins",
      icon: FiShield,
    },
  ];

  return (
    <div className="p-2 sm:p-8 bg-[color:var(--color-background)] min-h-screen transition-colors">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[color:var(--color-primary-text)] mb-8">
        User Management
      </h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-[color:var(--color-muted)]">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-[color:var(--color-primary)] text-[color:var(--color-primary)]"
                      : "border-transparent text-[color:var(--color-secondary-text)] hover:text-[color:var(--color-primary-text)] hover:border-[color:var(--color-muted)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[color:var(--color-background)] rounded-lg border border-[color:var(--color-muted)] shadow-md p-6">
        {activeTab === "users" && <UsersTab />}
        {activeTab === "organizers" && <OrganizersTab />}
        {activeTab === "admins" && <AdminsTab />}
      </div>
    </div>
  );
}

export default UserManagementPage;
