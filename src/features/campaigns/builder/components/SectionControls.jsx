import React from 'react';
import TextInput from './controls/TextInput';
import ImagePicker from './controls/ImagePicker';
import VisibilityToggle from './controls/VisibilityToggle';
import TextArea from './controls/TextArea';

const SectionControls = ({ section, onConfigChange }) => {
  const handleContentChange = (field, value) => {
    onConfigChange(draft => {
      const currentSection = draft.sections.find(s => s.key === section.key);
      if (currentSection) {
        currentSection.content[field] = value;
      }
    });
  };

  const handleVisibilityChange = (isVisible) => {
    onConfigChange(draft => {
      const currentSection = draft.sections.find(s => s.key === section.key);
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
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        if (key.toLowerCase().includes('image')) {
          return (
            <ImagePicker
              key={key}
              label={label}
              imageUrl={value}
              onChange={(url) => handleContentChange(key, url)}
            />
          );
        } else if (key === 'mission') {
          return (
            <TextArea
              key={key}
              label={label}
              value={value}
              onChange={(e) => handleContentChange(key, e.target.value)}
            />
          );
        } else if (typeof value === 'string') {
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
