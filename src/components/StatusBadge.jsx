import React from "react";

const DEFAULT_STATUS_COLORS = {
  active: "#10b981", // emerald
  pendingapproval: "#f59e0b", // amber
  pendingstart: "#3b82f6", // blue
  successful: "#22c55e", // green
  closed: "#64748b", // slate
  cancelled: "#ef4444", // red
  canceled: "#ef4444", // alias
  rejected: "#ef4444", // red
  failed: "#ef4444", // red
  yes: "#16a34a", // green
  no: "#dc2626", // red
  sent: "#10b981",
};
export const STATUS_COLORS = DEFAULT_STATUS_COLORS;

function toKey(status) {
  if (!status) return "";
  return String(status).replace(/\s+/g, "").replace(/-/g, "").toLowerCase();
}

function toLabel(status) {
  if (!status) return "";
  const s = String(status).trim();
  return s
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * StatusBadge
 *
 * Reusable badge with faint background derived from the status color.
 * - Uses predefined colors for common statuses
 * - Allows overriding via `color` prop
 *
 * Props:
 * - status: string (e.g., "active", "pending approval")
 * - label?: string (optional display text; defaults to formatted status)
 * - color?: string (hex or CSS color; overrides default mapping)
 * - className?: string (extra classes)
 */
function StatusBadge({ status, label, color, className = "" }) {
  const key = toKey(status);
  const resolvedColor = color || DEFAULT_STATUS_COLORS[key] || "#6b7280"; // slate fallback
  const bg = resolvedColor + "22"; // faint background
  const text = resolvedColor;
  const content = label || toLabel(status);

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ background: bg, color: text }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
