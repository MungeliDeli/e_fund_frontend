import React from "react";

function MetaCard({ title, value, Icon, color = "#43e97b", className = "" }) {
  return (
    <div
      className={`flex items-center gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-4 border border-[color:var(--color-muted)] ${className}`}
    >
      <span
        className="w-10 h-10 flex items-center justify-center rounded-full"
        style={{ background: color + "22" }}
      >
        {Icon ? <Icon className="text-xl" style={{ color }} /> : null}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[color:var(--color-secondary-text)]">
          {title}
        </span>
        <span className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          {value}
        </span>
      </div>
    </div>
  );
}

export default MetaCard;
