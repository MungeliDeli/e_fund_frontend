import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit3, FiUser, FiSettings } from "react-icons/fi";
import { PrimaryButton } from "../../../../components/Buttons";
import OrganizerDetailsTab from "./settingsTabs/OrganizerDetailsTab";
import OrganizerPayoutSettings from "./settingsTabs/OrganizerPayoutSettings";

function OrganizerSettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    {
      id: "details",
      label: "Organizer Details",
      icon: FiUser,
    },
    {
      id: "settings",
      label: "Settings",
      icon: FiSettings,
    },
  ];

  const handleEditDetails = () => {
    navigate("/organizer/settings/edit");
  };

  return (
    <div className="p-2 sm:p-8 bg-[color:var(--color-background)] min-h-screen transition-colors">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[color:var(--color-primary-text)] mb-8">
        Settings
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
        {activeTab === "details" && (
          <OrganizerDetailsTab onEditDetails={handleEditDetails} />
        )}
        {activeTab === "settings" && <OrganizerPayoutSettings />}
      </div>
    </div>
  );
}

export default OrganizerSettingsPage;
