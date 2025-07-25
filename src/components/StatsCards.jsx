import React, { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { FiChevronDown, FiFilter } from 'react-icons/fi';

// TotalStatsCard: For total counts (e.g., Total Organizers)
export function TotalStatsCard({ title, value, icon: Icon, iconColor = '#43e97b', className = '' }) {
  return (
    <div className={`flex flex-col gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-6 min-h-[140px] flex-1 border border-[color:var(--color-muted)] ${className}`}>
      <div className="text-[color:var(--color-secondary-text)] text-xl font-bold mb-3">{title}</div>
      <div className="border-t border-[color:var(--color-muted)] my-1" />
      <div className="flex items-center gap-4 mt-auto">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-full"
          style={{ background: iconColor + '22' }}
        >
          {Icon && <Icon className="text-2xl" style={{ color: iconColor }} />}
        </span>
        <span className="text-4xl font-bold text-[color:var(--color-primary-text)]">{value}</span>
      </div>
    </div>
  );
}

// PieStatsCard: For stats with two sections and a pie chart (e.g., Verified/Unverified)
export function PieStatsCard({
  title1,
  value1,
  icon1: Icon1,
  color1,
  label1,
  title2,
  value2,
  icon2: Icon2,
  color2,
  label2,
  pieSize = 60,
  className = '',
}) {
  const data = [
    { title: label1, value: value1, color: color1 },
    { title: label2, value: value2, color: color2 },
  ];
  return (
    <div className={`flex bg-[color:var(--color-surface)] rounded-xl shadow p-6 min-h-[140px] flex-1 border border-[color:var(--color-muted)] ${className}`}>
      {/* Left: Stats */}
      <div className="flex flex-col justify-between flex-1 pr-4">
        <div className="flex items-center gap-2 mb-2">
          {Icon1 && (
            <span className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: color1 + '22' }}>
              <Icon1 className="text-lg" style={{ color: color1 }} />
            </span>
          )}
          <span className="text-lg text-[color:var(--color-secondary-text)] font-bold">{title1}</span>
        </div>
        <div className="text-2xl font-bold text-[color:var(--color-primary-text)] mb-2">{value1}</div>
        <div className="border-t border-[color:var(--color-muted)] my-1" />
        <div className="flex items-center gap-2 mt-2">
          {Icon2 && (
            <span className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: color2 + '22' }}>
              <Icon2 className="text-lg" style={{ color: color2 }} />
            </span>
          )}
          <span className="text-lg text-[color:var(--color-secondary-text)] font-bold">{title2}</span>
        </div>
        <div className="text-2xl font-bold text-[color:var(--color-primary-text)]">{value2}</div>
      </div>
      {/* Right: Pie Chart */}
      <div className="flex items-center justify-center">
        <PieChart
          data={data}
          lineWidth={30}
          rounded
          animate
          style={{ height: pieSize, width: pieSize }}
        />
      </div>
    </div>
  );
}

export function StatusStatsCard({
  statuses = [],
  valueMap = {},
  initialStatusKey = '',
  onStatusChange,
  className = '',
}) {
  const [selected, setSelected] = useState(
    statuses.find((s) => s.key === initialStatusKey) || statuses[0] || {}
  );
  const [open, setOpen] = useState(false);

  const handleSelect = (status) => {
    setSelected(status);
    setOpen(false);
    if (onStatusChange) onStatusChange(status.key);
  };

  return (
    <div className={`relative flex flex-col gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-6 min-h-[140px] flex-1 border border-[color:var(--color-muted)] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold text-[color:var(--color-secondary-text)]">
          {selected.label}
        </span>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[color:var(--color-muted)] transition-colors relative"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <FiFilter className="text-lg" />
          <FiChevronDown className="text-base" />
        </button>
        {open && (
          <div className="absolute right-0 top-10 z-10 bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded shadow-lg min-w-[160px]">
            {statuses.map((status) => (
              <div
                key={status.key}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[color:var(--color-muted)] ${selected.key === status.key ? 'font-bold' : ''}`}
                onClick={() => handleSelect(status)}
              >
                {status.icon && (
                  <span className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background: status.color + '22' }}>
                    <status.icon className="text-lg" style={{ color: status.color }} />
                  </span>
                )}
                <span>{status.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-[color:var(--color-muted)] my-1" />
      <div className="flex items-center gap-4 mt-auto">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-full"
          style={{ background: selected.color + '22' }}
        >
          {selected.icon && <selected.icon className="text-2xl" style={{ color: selected.color }} />}
        </span>
        <span className="text-4xl font-bold text-[color:var(--color-primary-text)]">{valueMap[selected.key] || 0}</span>
      </div>
    </div>
  );
}