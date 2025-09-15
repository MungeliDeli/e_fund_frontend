import React from "react";

function ColoredIcon({ Icon, color = "#3b82f6", className = "" }) {
  return (
    <span
      className={`w-10 h-10 flex items-center justify-center rounded-full ${className}`}
      style={{ background: color + "22" }}
    >
      {Icon ? <Icon className="text-xl" style={{ color }} /> : null}
    </span>
  );
}

export default ColoredIcon;
