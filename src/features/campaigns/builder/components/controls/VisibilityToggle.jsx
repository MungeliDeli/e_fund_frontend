import React from 'react';

const VisibilityToggle = ({ isVisible, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-[color:var(--color-primary-text)]">Section Visibility</span>
      <button
        onClick={() => onChange(!isVisible)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-primary)] ${
          isVisible ? 'bg-[color:var(--color-primary)]' : 'bg-[color:var(--color-muted)]'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
            isVisible ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default VisibilityToggle;
