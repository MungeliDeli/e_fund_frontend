import React from "react";

function AuditDetailsModal({ isOpen, onClose, details }) {
  if (!isOpen) return null;

  const entries = (() => {
    if (!details) return [];
    if (typeof details === "string") {
      try {
        const parsed = JSON.parse(details);
        return Object.entries(parsed || {});
      } catch {
        return [["raw", details]];
      }
    }
    if (typeof details === "object") return Object.entries(details);
    return [["value", String(details)]];
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg shadow-xl w-[90vw] max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--color-muted)]">
          <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
            Details
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:bg-[color:var(--color-muted)] transition-colors"
          >
            Close
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[70vh]">
          {entries.length === 0 ? (
            <div className="text-[color:var(--color-secondary-text)]">
              No details
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map(([key, value]) => (
                <div key={key} className="flex gap-4">
                  <div className="w-40 shrink-0 text-[color:var(--color-secondary-text)] font-medium">
                    {key}
                  </div>
                  <div className="flex-1 text-[color:var(--color-primary-text)] break-words">
                    {typeof value === "object" ? (
                      <pre className="whitespace-pre-wrap break-words text-sm">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      String(value)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditDetailsModal;
