import React from 'react';

const TextInput = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-[color:var(--color-background)] border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
      />
    </div>
  );
};

export default TextInput;
