import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import SectionControls from "./SectionControls";

const SectionEditor = ({
  sections,
  onConfigChange,
  onImageMetadata,
  getImageKey,
}) => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (key) => {
    setOpenSection(openSection === key ? null : key);
  };

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div
          key={section.key}
          className="bg-[color:var(--color-background)] rounded-lg"
        >
          <button
            onClick={() => toggleSection(section.key)}
            className="w-full flex items-center justify-between p-3 font-semibold text-[color:var(--color-primary-text)]"
          >
            <span>{section.label}</span>
            {openSection === section.key ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openSection === section.key && (
            <div className="p-4 border-t border-[color:var(--color-border)]">
              <SectionControls
                section={section}
                onConfigChange={onConfigChange}
                onImageMetadata={onImageMetadata}
                getImageKey={getImageKey}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SectionEditor;
