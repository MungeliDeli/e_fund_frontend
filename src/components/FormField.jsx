import React from 'react';

function FormField({
  label,
  required = false,
  error = '',
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  className = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-[color:var(--color-secondary-text)] text-sm mb-1 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`rounded-lg bg-[color:var(--color-surface)] px-4 py-2 text-[color:var(--color-primary-text)] placeholder-[color:var(--color-secondary-text)] text-base outline-none border border-transparent focus:border-[color:var(--color-accent)] transition ${error ? 'border-red-500' : ''}`}
        autoComplete="off"
        {...rest}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}

export default FormField; 