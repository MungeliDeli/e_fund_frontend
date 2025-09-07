import React from "react";
import { FiX } from "react-icons/fi";

function EntityViewModal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[color:var(--color-background)] p-4 rounded-lg border border-[color:var(--color-muted)] shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-2 border-b border-[color:var(--color-muted)]">
          <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[color:var(--color-muted)] rounded transition-colors"
            aria-label="Close"
          >
            <FiX className="text-xl text-[color:var(--color-primary-text)]" />
          </button>
        </div>
        <div className="p-2 space-y-3">{children}</div>
        {footer && (
          <div className="flex justify-end items-center gap-2 p-3 border-t border-[color:var(--color-muted)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default EntityViewModal;
