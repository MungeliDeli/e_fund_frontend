import React from "react";
import { FiAward, FiUser, FiMessageSquare } from "react-icons/fi";

/**
 * TopDonors Component
 *
 * Displays a list of top donors for a campaign with ranking, amounts,
 * and donation messages. Handles anonymous donors appropriately.
 *
 * @param {Object} props
 * @param {Array} props.topDonors - Array of top donors data from API
 * @param {string} props.className - Additional CSS classes
 */
function TopDonors({ topDonors, className = "" }) {
  if (!topDonors || topDonors.length === 0) {
    return (
      <div
        className={`bg-[color:var(--color-surface)] rounded-xl shadow p-6 border border-[color:var(--color-muted)] ${className}`}
      >
        <div className="text-center text-[color:var(--color-secondary-text)]">
          No donor data available yet
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }).format(amount);
    } catch {
      return `$${Number(amount).toFixed(2)}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return String(dateString);
    }
  };

  return (
    <div
      className={`bg-[color:var(--color-surface)] rounded-xl shadow p-6 border border-[color:var(--color-muted)] ${className}`}
    >
      <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
        Top Donors
      </h3>

      <div className="space-y-3">
        {topDonors.map((donor, index) => (
          <div
            key={`${donor.donorId}-${index}`}
            className="flex items-center gap-4 p-4 bg-[color:var(--color-background)] rounded-lg border border-[color:var(--color-muted)]"
          >
            {/* Ranking */}
            <div className="flex-shrink-0">
              {index === 0 && (
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 bg-opacity-20">
                  <FiAward className="text-yellow-500 text-lg" />
                </div>
              )}
              {index === 1 && (
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 bg-opacity-20">
                  <FiAward className="text-gray-400 text-lg" />
                </div>
              )}
              {index === 2 && (
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 bg-opacity-20">
                  <FiAward className="text-orange-500 text-lg" />
                </div>
              )}
              {index > 2 && (
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--color-muted)] bg-opacity-20">
                  <span className="text-sm font-bold text-[color:var(--color-secondary-text)]">
                    #{index + 1}
                  </span>
                </div>
              )}
            </div>

            {/* Donor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FiUser className="text-[color:var(--color-secondary-text)]" />
                <span className="font-medium text-[color:var(--color-primary-text)]">
                  {donor.isAnonymous
                    ? "Anonymous Donor"
                    : `Donor #${donor.donorId}`}
                </span>
              </div>

              {/* Donation Message */}
              {donor.message && (
                <div className="flex items-start gap-2">
                  <FiMessageSquare className="text-[color:var(--color-secondary-text)] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[color:var(--color-secondary-text)] italic line-clamp-2">
                    "{donor.message}"
                  </p>
                </div>
              )}

              {/* Donation Date */}
              <div className="text-xs text-[color:var(--color-secondary-text)] mt-1">
                {formatDate(donor.donationDate)}
              </div>
            </div>

            {/* Amount */}
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-bold text-[color:var(--color-primary-text)]">
                {formatCurrency(donor.amount)}
              </div>
              <div className="text-xs text-[color:var(--color-secondary-text)]">
                Donation
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-[color:var(--color-muted)] text-center">
        <div className="text-sm text-[color:var(--color-secondary-text)]">
          Showing top {topDonors.length} donors by amount
        </div>
      </div>
    </div>
  );
}

export default TopDonors;
