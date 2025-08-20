import React, { useState } from "react";
import { FiUser } from "react-icons/fi";

function RecentDonations({ themeColor }) {
  const [showAll, setShowAll] = useState(false);

  // Mock data - replace with actual API call
  const mockDonations = [
    {
      id: 1,
      name: "Anonymous",
      amount: 50,
      isTopDonor: false,
      timeAgo: "2 hours ago",
    },
    {
      id: 2,
      name: "Munge deli",
      amount: 430,
      isTopDonor: true,
      timeAgo: "5 hours ago",
    },
    {
      id: 3,
      name: "Davy Mwansa",
      amount: 550,
      isTopDonor: true,
      timeAgo: "1 day ago",
    },
    {
      id: 4,
      name: "Davy Mwansa",
      amount: 40,
      isTopDonor: false,
      timeAgo: "2 days ago",
    },
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const displayedDonations = showAll
    ? mockDonations
    : mockDonations.slice(0, 4);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: themeColor }}
        >
          Recent Donations
        </h3>
        <div
          className="w-full h-px"
          style={{ backgroundColor: `${themeColor}40` }}
        ></div>
      </div>

      {/* Donations List */}
      <div className="space-y-3">
        {displayedDonations.map((donation) => (
          <div key={donation.id} className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <FiUser className="w-4 h-4" style={{ color: themeColor }} />
            </div>

            {/* Donation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-black">
                    {donation.name} donated{" "}
                    <span className="font-bold">
                      {formatAmount(donation.amount)}
                    </span>
                  </span>
                </div>
                {donation.isTopDonor && (
                  <span
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      color: themeColor,
                    }}
                  >
                    Top Donor
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See All Button */}
      <div className="mt-4">
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 px-4 rounded-lg border-2 font-medium transition-colors"
          style={{
            borderColor: `${themeColor}40`,
            color: themeColor,
            backgroundColor: "white",
          }}
        >
          See all Donations
        </button>
      </div>
    </div>
  );
}

export default RecentDonations;
