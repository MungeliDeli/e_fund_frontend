import React from "react";
import ColoredIcon from "../../../components/ColoredIcon";

function MetaCard({ title, value, Icon, color = "#43e97b", className = "" }) {
  return (
    <div
      className={`flex items-center gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-4 border border-[color:var(--color-muted)] ${className}`}
    >
      <ColoredIcon Icon={Icon} color={color} />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[color:var(--color-secondary-text)]">
          {title}
        </span>
        <span className="text-xl font-semibold text-[color:var(--color-primary-text)]">
          {value}
        </span>
      </div>
    </div>
  );
}

export default MetaCard;
