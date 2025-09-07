import React from 'react';
import { PrimaryButton, SecondaryButton } from "./Buttons";


const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[color:var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-[color:var(--color-primary-text)]">{title}</h3>
        <p className="mt-2 text-[color:var(--color-secondary-text)]">{message}</p>
        <div className="mt-6 flex justify-end gap-4">
          <SecondaryButton
            onClick={onClose}
            // className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </SecondaryButton>
          <PrimaryButton
            onClick={onConfirm}
            // className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
