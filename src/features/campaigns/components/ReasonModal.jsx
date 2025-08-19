import React, { useState, useEffect } from "react";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons";

function ReasonModal({
  isOpen,
  title = "Provide Reason",
  placeholder = "Type your reason...",
  initialValue = "",
  confirmText = "Submit",
  confirmLoading = false,
  onConfirm,
  onClose,
}) {
  const [value, setValue] = useState(initialValue || "");
  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!value.trim()) return; // require non-empty
    onConfirm?.(value.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[color:var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-bold text-[color:var(--color-primary-text)]">
          {title}
        </h3>
        <textarea
          className="mt-4 w-full min-h-[120px] p-3 rounded border border-[color:var(--color-muted)] bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="mt-6 flex justify-end gap-3">
          <SecondaryButton onClick={onClose} disabled={confirmLoading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            loading={confirmLoading}
            disabled={confirmLoading || !value.trim()}
          >
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default ReasonModal;
