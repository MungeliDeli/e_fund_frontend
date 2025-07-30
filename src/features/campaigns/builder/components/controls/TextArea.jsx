import React from 'react';

const TextArea = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        rows="5"
        className="w-full px-3 py-2 bg-[color:var(--color-background)] border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
      />
    </div>
  );
};

export default TextArea;
