import React from 'react';

const ColorPicker = ({ label, color, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 p-0 border-none rounded cursor-pointer"
        />
        <span className="text-sm text-[color:var(--color-primary-text)]">{color}</span>
      </div>
    </div>
  );
};

export default ColorPicker;
