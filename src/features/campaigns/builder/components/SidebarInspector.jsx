import React, { useState, useCallback } from "react";
import {
  FiSettings,
  FiLayout,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import ThemeEditor from "./ThemeEditor";
import SectionEditor from "./SectionEditor";

const SidebarInspector = ({
  config,
  onConfigChange,
  onImageMetadata,
  getImageKey,
}) => {
  const [activeTab, setActiveTab] = useState("content");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-full w-full bg-[color:var(--color-surface)] rounded-lg shadow-lg flex flex-col">
      <div className="flex-shrink-0 border-b border-[color:var(--color-border)]">
        <div className="flex items-center justify-around">
          <TabButton
            icon={<FiLayout />}
            label="Content"
            isActive={activeTab === "content"}
            onClick={() => handleTabChange("content")}
          />
          <TabButton
            icon={<FiSettings />}
            label="Theme"
            isActive={activeTab === "theme"}
            onClick={() => handleTabChange("theme")}
          />
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {activeTab === "content" && (
          <SectionEditor
            sections={config.sections}
            onConfigChange={onConfigChange}
            onImageMetadata={onImageMetadata}
            getImageKey={getImageKey}
          />
        )}
        {activeTab === "theme" && (
          <ThemeEditor theme={config.theme} onConfigChange={onConfigChange} />
        )}
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-semibold transition-colors ${
      isActive
        ? "text-[color:var(--color-primary)] border-b-2 border-[color:var(--color-primary)]"
        : "text-[color:var(--color-secondary-text)] hover:bg-[color:var(--color-background)]"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default SidebarInspector;
