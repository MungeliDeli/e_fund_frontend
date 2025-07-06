import React from 'react';

// Dropdown.jsx
// This file defines a reusable Dropdown component for selecting options from a list.
// It is designed to be used in forms or anywhere a dropdown selection is needed in the app.
// The component supports custom options, labels, and integrates with form state.

function Dropdown({
  options = [],
  value,
  onChange,
  error = '',
  required = false,
  placeholder = 'Select...',
  className = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className={`rounded-lg bg-[color:var(--color-surface)] px-4 py-2 text-[color:var(--color-primary-text)] text-base outline-none border border-transparent focus:border-[color:var(--color-accent)] transition appearance-none ${error ? 'border-red-500' : ''}`}
        {...rest}
      >
        <option value="">{placeholder}{required ? ' *' : ''}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}

export default Dropdown; 