/**
 * DonationsTab Component
 *
 * Displays user donation history and statistics. This tab shows different
 * information based on whether the viewer is the profile owner or a visitor.
 *
 * Key Features:
 * - Donation history display with campaign information
 * - Filter by date and amount
 * - Campaign visit links
 * - Responsive card layout
 * - Privacy-aware data display
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDonationsByUser } from "../../../../donations/services/donationsApi";
import { useAuth } from "../../../../../contexts/AuthContext";
import { formatTimeAgo } from "../../../../../utils/timeUtils";

function DonationsTab() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("date"); // "date" or "amount"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc"

  const {
    data: donations,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userDonations", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const response = await getDonationsByUser(user.userId, {
        limit: 100,
        offset: 0,
      });
      return response.data.data || response.data || [];
    },
    enabled: !!user?.userId,
  });

  // Filter and sort donations
  const filteredDonations = useMemo(() => {
    if (!donations) return [];

    const sorted = [...donations].sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.donationDate);
        const dateB = new Date(b.donationDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

    return sorted;
  }, [donations, sortBy, sortOrder]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      // If clicking the same sort field, toggle the order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If clicking a different sort field, set it and default to desc
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const formatAmount = (amount) => {
    return `K${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "refunded":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCampaignTitle = (customPageSettings) => {
    if (!customPageSettings) return "Campaign";
    try {
      const settings =
        typeof customPageSettings === "string"
          ? JSON.parse(customPageSettings)
          : customPageSettings;
      return settings.title || "Campaign";
    } catch {
      return "Campaign";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-[color:var(--color-text)]">
          Loading donations...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2 text-red-500">
          Error Loading Donations
        </h3>
        <p className="text-[color:var(--color-secondary-text)]">
          {error?.response?.data?.message ||
            error?.message ||
            "Failed to load donations"}
        </p>
      </div>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">No Donations Yet</h3>
        <p className="text-[color:var(--color-secondary-text)]">
          Your donation history will appear here once you make your first
          donation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--color-text)]">
            Donation History
          </h3>
          <p className="text-sm text-[color:var(--color-secondary-text)]">
            {donations.length} donation{donations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-4">
          <button
            onClick={() => handleSort("date")}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[color:var(--color-text)] border border-[color:var(--color-muted)] rounded-md hover:bg-[color:var(--color-surface)] transition-colors"
          >
            Date
            {sortBy === "date" && (
              <span className="text-[color:var(--color-primary)]">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSort("amount")}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[color:var(--color-text)] border border-[color:var(--color-muted)] rounded-md hover:bg-[color:var(--color-surface)] transition-colors"
          >
            Amount
            {sortBy === "amount" && (
              <span className="text-[color:var(--color-primary)]">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Donations List */}
      <div className="space-y-4">
        {filteredDonations.map((donation) => (
          <div
            key={donation.donationId}
            className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-6 hover:bg-[color:var(--color-surface)] transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Main Content */}
              <div className="flex-1 space-y-3">
                {/* Amount and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[color:var(--color-text)]">
                      {formatAmount(donation.amount)}
                    </span>
               
                  </div>
                  <span className="text-sm text-[color:var(--color-secondary-text)]">
                    {formatTimeAgo(donation.donationDate)}
                  </span>
                </div>

                {/* Campaign Information */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-semibold text-[color:var(--color-text)] flex-1">
                      {getCampaignTitle(donation.customPageSettings)}
                    </h4>
                    {donation.campaignShareLink && (
                      <Link
                        to={`/campaign/${donation.campaignShareLink}-${(
                          getCampaignTitle(donation.customPageSettings) || ""
                        )
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 80)}`}
                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-[color:var(--color-primary)] border border-[color:var(--color-primary)] rounded-md hover:bg-[color:var(--color-surface)] transition-colors"
                      >
                        Visit
                      </Link>
                    )}
                  </div>
                  {donation.messageText && (
                    <div className="bg-[color:var(--color-muted)] rounded-md p-3">
                      <p className="text-sm text-[color:var(--color-text)] italic">
                        "{donation.messageText}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Transaction Details */}
                <div className="flex flex-wrap gap-4 text-sm text-[color:var(--color-secondary-text)]">
                  {donation.gatewayUsed && (
                    <span>
                      Payment:{" "}
                      {donation.gatewayUsed
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  )}
                  {donation.isAnonymous && (
                    <span className="text-blue-600">Anonymous</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonationsTab;
