import React from "react";

function QuickDonation({ themeColor, onDonateClick }) {
  return (
    <div 
      className="rounded-lg p-6 text-center"
      style={{ backgroundColor: `${themeColor}15` }}
    >
      {/* Header */}
      <h3 
        className="text-lg font-semibold mb-2"
        style={{ color: themeColor }}
      >
        Quick Donation
      </h3>

      {/* Description */}
      <p className="text-sm text-[color:var(--color-secondary-text)] mb-4">
        Make a quick donation to support this campaign and help reach the goal faster.
      </p>

      {/* Donate Button */}
      <button
        onClick={onDonateClick}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          backgroundColor: themeColor,
          focusRingColor: themeColor
        }}
      >
        Donate Today
      </button>

      {/* Additional Info */}
      <p className="text-xs text-[color:var(--color-secondary-text)] mt-3">
        Your donation will make a difference
      </p>
    </div>
  );
}

export default QuickDonation;