import React from "react";
import { FiUsers, FiUserCheck, FiUserX } from "react-icons/fi";

/**
 * DonorInsights Component
 *
 * Displays campaign donor insights including total donations, unique donors,
 * and anonymous vs named donations breakdown with a visual pie chart.
 *
 * @param {Object} props
 * @param {Object} props.donorInsights - Donor insights data from API
 * @param {string} props.className - Additional CSS classes
 */
function DonorInsights({ donorInsights, className = "" }) {
  if (!donorInsights) {
    return (
      <div
        className={`bg-[color:var(--color-surface)] rounded-xl shadow p-6 border border-[color:var(--color-muted)] ${className}`}
      >
        <div className="text-center text-[color:var(--color-secondary-text)]">
          No donor data available
        </div>
      </div>
    );
  }

  const {
    totalDonations = 0,
    uniqueDonors = 0,
    anonymousDonations = { count: 0, percentage: 0 },
    namedDonations = { count: 0, percentage: 0 },
  } = donorInsights;

  // Pie chart dimensions and calculations
  const radius = 60;
  const centerX = 80;
  const centerY = 80;
  const circumference = 2 * Math.PI * radius;

  // Calculate SVG arc paths for pie chart
  const namedAngle = (namedDonations.percentage / 100) * 360;
  const anonymousAngle = 360 - namedAngle;

  const namedArc = describeArc(centerX, centerY, radius, 0, namedAngle);
  const anonymousArc = describeArc(centerX, centerY, radius, namedAngle, 360);

  return (
    <div
      className={`bg-[color:var(--color-surface)] rounded-xl shadow p-6 border border-[color:var(--color-muted)] ${className}`}
    >
      <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
        Donor Insights
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FiUsers className="text-2xl text-[color:var(--color-accent)]" />
          </div>
          <div className="text-2xl font-bold text-[color:var(--color-primary-text)]">
            {totalDonations}
          </div>
          <div className="text-sm text-[color:var(--color-secondary-text)]">
            Total Donations
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FiUserCheck className="text-2xl text-[color:var(--color-accent)]" />
          </div>
          <div className="text-2xl font-bold text-[color:var(--color-primary-text)]">
            {uniqueDonors}
          </div>
          <div className="text-sm text-[color:var(--color-secondary-text)]">
            Unique Donors
          </div>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-[color:var(--color-secondary-text)] uppercase tracking-wide mb-4">
          Donation Distribution
        </h4>

        <div className="flex items-center justify-center">
          <div className="relative">
            {/* SVG Pie Chart */}
            <svg width="160" height="160" className="mb-4">
              {/* Named Donations Slice */}
              <path
                d={namedArc}
                fill="var(--color-accent)"
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
              {/* Anonymous Donations Slice */}
              <path
                d={anonymousArc}
                fill="var(--color-muted)"
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
              {/* Center circle for better visual appeal */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius * 0.3}
                fill="var(--color-background)"
              />
              {/* Center text */}
              <text
                x={centerX}
                y={centerY + 5}
                textAnchor="middle"
                className="text-sm font-semibold"
                fill="var(--color-secondary-text)"
              >
                {totalDonations}
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Donation Type Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-secondary-text)] uppercase tracking-wide">
          Donation Types
        </h4>

        {/* Named Donations */}
        <div className="flex items-center justify-between p-3 bg-[color:var(--color-background)] rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--color-accent)] bg-opacity-20">
              <FiUserCheck className="text-white" />
            </div>
            <div>
              <div className="font-medium text-[color:var(--color-primary-text)]">
                Named Donations
              </div>
              <div className="text-sm text-[color:var(--color-secondary-text)]">
                {namedDonations.count} donations
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[color:var(--color-primary-text)]">
              {namedDonations.percentage}%
            </div>
            <div className="text-sm text-[color:var(--color-secondary-text)]">
              of total
            </div>
          </div>
        </div>

        {/* Anonymous Donations */}
        <div className="flex items-center justify-between p-3 bg-[color:var(--color-background)] rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--color-muted)] bg-opacity-20">
              <FiUserX className="text-[color:var(--color-secondary-text)]" />
            </div>
            <div>
              <div className="font-medium text-[color:var(--color-primary-text)]">
                Anonymous Donations
              </div>
              <div className="text-sm text-[color:var(--color-secondary-text)]">
                {anonymousDonations.count} donations
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[color:var(--color-primary-text)]">
              {anonymousDonations.percentage}%
            </div>
            <div className="text-sm text-[color:var(--color-secondary-text)]">
              of total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to create SVG arc path for pie chart
 * @param {number} centerX - X coordinate of center
 * @param {number} centerY - Y coordinate of center
 * @param {number} radius - Radius of the pie
 * @param {number} startAngle - Start angle in degrees
 * @param {number} endAngle - End angle in degrees
 * @returns {string} SVG path string
 */
function describeArc(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    centerX,
    centerY,
    "Z",
  ].join(" ");
}

/**
 * Helper function to convert polar coordinates to Cartesian
 * @param {number} centerX - X coordinate of center
 * @param {number} centerY - Y coordinate of center
 * @param {number} radius - Radius
 * @param {number} angleInDegrees - Angle in degrees
 * @returns {Object} Cartesian coordinates {x, y}
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default DonorInsights;
