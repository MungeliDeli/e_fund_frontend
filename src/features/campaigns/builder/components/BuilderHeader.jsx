import React from "react";
import { FiArrowLeft, FiSave, FiCheckCircle } from "react-icons/fi";

const BuilderHeader = ({
  onBack,
  onSaveAsDraft,
  onSubmit,
  isSaving = false,
}) => {
  return (
    <div className="bg-[color:var(--color-surface)] shadow-md p-4 flex justify-between items-center">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[color:var(--color-secondary-text)] rounded-md hover:text-[color:var(--color-primary)] transition-colors"
      >
        <FiArrowLeft />
        <span>Back</span>
      </button>
      <div className="flex items-center gap-4">
        <button
          onClick={onSaveAsDraft}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isSaving
              ? "text-[color:var(--color-secondary-text)] cursor-not-allowed"
              : "text-[color:var(--color-primary)] hover:border hover:border-[color:var(--color-primary)]"
          }`}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--color-primary)]"></div>
          ) : (
            <FiSave />
          )}
          <span>{isSaving ? "Saving..." : "Save Draft"}</span>
        </button>
        <button
          onClick={onSubmit}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-md transition-colors ${
            isSaving
              ? "text-[color:var(--color-secondary-text)] bg-[color:var(--color-muted)] border-[color:var(--color-muted)] cursor-not-allowed"
              : "text-white bg-[color:var(--color-primary)] border-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)]"
          }`}
        >
          <FiCheckCircle />
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

export default BuilderHeader;
