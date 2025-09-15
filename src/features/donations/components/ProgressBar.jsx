import React from "react";

/**
 * ProgressBar Component
 *
 * Displays campaign progress with visual progress bar, percentage, and color coding
 * based on completion percentage (red < 50%, yellow 50-80%, green > 80%)
 *
 * @param {Object} props
 * @param {number} props.percentage - Progress percentage (0-100)
 * @param {number} props.currentAmount - Current amount raised
 * @param {number} props.goalAmount - Goal amount
 * @param {string} props.className - Additional CSS classes
 */
function ProgressBar({
  percentage,
  currentAmount,
  goalAmount,
  className = "",
}) {
  // Determine progress status and color
  let statusColor = "var(--color-accent)"; // Default green
  let statusText = "On Track";

  if (percentage < 50) {
    statusColor = "#ef4444"; // Red
    statusText = "Needs Support";
  } else if (percentage < 80) {
    statusColor = "#f59e0b"; // Yellow/Orange
    statusText = "Making Progress";
  }

  // Ensure percentage is within bounds
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div
      className={`bg-[color:var(--color-surface)] rounded-xl shadow p-6 border border-[color:var(--color-muted)] ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
          Campaign Progress
        </h3>
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{
            backgroundColor: statusColor + "22",
            color: statusColor,
          }}
        >
          {statusText}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[color:var(--color-secondary-text)]">
            Progress
          </span>
          <span className="text-lg font-semibold text-[color:var(--color-primary-text)]">
            {safePercentage.toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[color:var(--color-muted)] rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${safePercentage}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>
      </div>

      {/* Amount Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-xl font-semibold text-[color:var(--color-primary-text)]">
            K{currentAmount?.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-[color:var(--color-secondary-text)]">
            Raised
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-[color:var(--color-secondary-text)]">
            K{goalAmount?.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-[color:var(--color-secondary-text)]">
            Goal
          </div>
        </div>
      </div>

      {/* Remaining Amount */}
      <div className="mt-4 pt-4 border-t border-[color:var(--color-muted)] text-center">
        <div className="text-sm text-[color:var(--color-secondary-text)]">
          {goalAmount && currentAmount ? (
            <>
              <span className="font-semibold">
                K{(goalAmount - currentAmount).toLocaleString()}
              </span>{" "}
              still needed
            </>
          ) : (
            "Goal amount not set"
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
