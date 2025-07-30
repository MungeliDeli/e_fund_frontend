import React from "react";
import { FiArrowLeft, FiSave, FiCheckCircle } from "react-icons/fi";

const BuilderHeader = ({ onBack, onSaveDraft, onSubmit }) => {
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
          onClick={onSaveDraft}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] rounded-md hover:border hover:border-[color:var(--color-primary)] transition-colors"
        >
          <FiSave />
          <span>Save Draft</span>
        </button>
        <button
          onClick={onSubmit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[color:var(--color-primary)] border border-[color:var(--color-primary)] rounded-md hover:bg-[color:var(--color-accent)] transition-colors"
        >
          <FiCheckCircle />
          <span>Submit</span>
        </button>
      </div>
    </div>
  );
};

export default BuilderHeader;
