import React from "react";
import {
  FiAward,
  FiUser,
  FiMessageSquare,
  FiExternalLink,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import ColoredIcon from "../../../components/ColoredIcon";

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
        currency: "k",
      }).format(amount);
    } catch {
      return `K${Number(amount).toFixed(2)}`;
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
                <ColoredIcon
                  Icon={FiAward}
                  color="#eab308"
                  className="w-8 h-8"
                />
              )}
              {index === 1 && (
                <ColoredIcon
                  Icon={FiAward}
                  color="#9ca3af"
                  className="w-8 h-8"
                />
              )}
              {index === 2 && (
                <ColoredIcon
                  Icon={FiAward}
                  color="#f97316"
                  className="w-8 h-8"
                />
              )}
              {index > 2 && (
                <span
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: "var(--color-muted)" + "33" }}
                >
                  <span className="text-sm font-bold text-[color:var(--color-secondary-text)]">
                    #{index + 1}
                  </span>
                </span>
              )}
            </div>

            {/* Donor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FiUser className="text-[color:var(--color-secondary-text)]" />
                {donor.isAnonymous ? (
                  <span className="font-medium text-[color:var(--color-primary-text)]">
                    Anonymous Donor
                  </span>
                ) : donor.donorDetails ? (
                  <Link
                    to={
                      donor.donorDetails.type === "organization"
                        ? `/organizers/${donor.donorDetails.userId}`
                        : `/users/${donor.donorDetails.userId}`
                    }
                    className="font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]/80 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {donor.donorDetails.displayName}
                    <FiExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                ) : (
                  <span className="font-medium text-[color:var(--color-primary-text)]">
                    Donor #{donor.donorId}
                  </span>
                )}
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
