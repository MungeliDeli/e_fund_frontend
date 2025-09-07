import React, { useState } from "react";

function PreviewCollapse() {
  const [open, setOpen] = useState(false);

  // Template functionality removed during demolition

  return (
    <div className="mt-4">
      <button
        type="button"
        className="px-4 py-2 rounded-lg border border-[color:var(--color-muted)] bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)]"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide Preview" : "Preview Page"}
      </button>
      {open && (
        <div className="mt-4 rounded-xl border border-[color:var(--color-muted)] overflow-hidden">
          <div className="p-6 text-center text-[color:var(--color-secondary-text)]">
            Template preview functionality removed during demolition.
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewCollapse;
