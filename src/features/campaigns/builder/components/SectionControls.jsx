import React from "react";
import TextInput from "./controls/TextInput";
import ImagePicker from "./controls/ImagePicker";
import VisibilityToggle from "./controls/VisibilityToggle";
import TextArea from "./controls/TextArea";
import DonationAmountsInput from "./controls/DonationAmountsInput";

const SectionControls = ({
  section,
  onConfigChange,
  onImageMetadata,
  getImageKey,
}) => {
  const handleContentChange = (field, value) => {
    onConfigChange((draft) => {
      const currentSection = draft.sections.find((s) => s.key === section.key);
      if (currentSection) {
        currentSection.content[field] = value;
      }
    });
  };

  const handleImageMetadata = (field, metadata) => {
    // Store image metadata separately for backend processing
    if (onImageMetadata) {
      onImageMetadata(section.key, field, metadata);
    }
  };

  const handleVisibilityChange = (isVisible) => {
    onConfigChange((draft) => {
      const currentSection = draft.sections.find((s) => s.key === section.key);
      if (currentSection) {
        currentSection.visible = isVisible;
      }
    });
  };

  return (
    <div className="space-y-4">
      {section.allowToggle && (
        <VisibilityToggle
          isVisible={section.visible}
          onChange={handleVisibilityChange}
        />
      )}
      {Object.entries(section.content).map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        if (key.toLowerCase().includes("image")) {
          // Determine slot name for key generation (e.g., 'logo', 'main', etc.)
          const slot =
            section.key.toLowerCase().includes("logo") ||
            key.toLowerCase().includes("logo")
              ? "logo"
              : key.toLowerCase().includes("hero") ||
                section.key.toLowerCase().includes("hero")
              ? "main"
              : key;
          return (
            <ImagePicker
              key={key}
              label={label}
              imageUrl={value}
              onChange={(url) => handleContentChange(key, url)}
              onImageMetadata={(metadata) => handleImageMetadata(key, metadata)}
              customKey={getImageKey ? getImageKey(slot) : undefined}
            />
          );
        } else if (key === "mission") {
          return (
            <TextArea
              key={key}
              label={label}
              value={value}
              onChange={(e) => handleContentChange(key, e.target.value)}
            />
          );
        } else if (key === "presetAmounts") {
          return (
            <DonationAmountsInput
              key={key}
              label={label}
              value={value}
              onChange={(amounts) => handleContentChange(key, amounts)}
            />
          );
        } else if (typeof value === "string") {
          return (
            <TextInput
              key={key}
              label={label}
              value={value}
              onChange={(e) => handleContentChange(key, e.target.value)}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default SectionControls;
