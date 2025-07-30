import React from 'react';
import { FiCheck } from "react-icons/fi";
import ColorPicker from './controls/ColorPicker';

const ThemeEditor = ({ theme, onConfigChange }) => {
  const handleThemeChange = (property, value) => {
    onConfigChange(draft => {
      draft.theme[property] = value;
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] flex items-center gap-2">
        <FiCheck />
        <span>Theme Settings</span>
      </h3>
      <div className="space-y-4">
        <ColorPicker
          label="Primary Color"
          color={theme.primaryColor}
          onChange={(color) => handleThemeChange('primaryColor', color)}
        />
        <ColorPicker
          label="Accent Color"
          color={theme.accentColor}
          onChange={(color) => handleThemeChange('accentColor', color)}
        />
        <ColorPicker
          label="Background Color"
          color={theme.backgroundColor}
          onChange={(color) => handleThemeChange('backgroundColor', color)}
        />
        <ColorPicker
          label="Text Color"
          color={theme.textColor}
          onChange={(color) => handleThemeChange('textColor', color)}
        />
      </div>
    </div>
  );
};

export default ThemeEditor;
