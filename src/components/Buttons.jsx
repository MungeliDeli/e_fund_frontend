import React from 'react';

// Primary action button (e.g., Add, Apply)
export function PrimaryButton({ icon: Icon, children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-medium hover:bg-green-700 transition-colors ${className}`}
      type="button"
      {...props}
    >
      {Icon && <Icon className="text-lg" />}
      {children}
    </button>
  );
}

// Secondary action button (e.g., Filter, Clear All)
export function SecondaryButton({ icon: Icon, children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[color:var(--color-muted)] bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors ${className}`}
      type="button"
      {...props}
    >
      {Icon && <Icon className="text-lg" />}
      {children}
    </button>
  );
}

// Icon-only or icon+text button (e.g., View, close modal)
export function IconButton({ icon: Icon, children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center justify-center gap-1 p-1 rounded transition-colors ${className}`}
      type="button"
      {...props}
    >
      {Icon && <Icon className="text-xl" />}
      {children}
    </button>
  );
} 