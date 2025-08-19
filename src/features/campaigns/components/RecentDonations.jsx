import React, { useState } from "react";
import { FiUser } from "react-icons/fi";

function RecentDonations({ themeColor }) {
  const [showAll, setShowAll] = useState(false);

  // Mock data - replace with actual API call
  const mockDonations = [
    {
      id: 1,
      name: "Anonymous",
      amount: 850,
      isTopDonor: false,
      timeAgo: "2 hours ago"
    },
    {
      id: 2,
      name: "Munge deli",
      amount: 430,
      isTopDonor: true,
      timeAgo: "5 hours ago"
    },
    {
      id: 3,
      name: "Davy Mwanza",
      amount: 650,
      isTopDonor: false,
      timeAgo: "1 day ago"
    },
    {
      id: 4,
      name: "Davy Mwanza",
      amount: 40,
      isTopDonor: false,
      timeAgo: "2 days ago"
    },
    {
      id: 5,
      name: "Sarah Johnson",
      amount: 200,
      isTopDonor: false,
      timeAgo: "3 days ago"
    },
    {
      id: 6,
      name: "Michael Chen",
      amount: 100,
      isTopDonor: false,
      timeAgo: "4 days ago"
    }
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayedDonations = showAll ? mockDonations : mockDonations.slice(0, 4);

  return (
    <div className="bg-[color:var(--color-surface)] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-semibold border-b-2 pb-1"
          style={{ 
            color: themeColor,
            borderBottomColor: themeColor
          }}
        >
          Recent Donations
        </h3>
      </div>

      {/* Donations List */}
      <div className="space-y-3">
        {displayedDonations.map((donation) => (
          <div key={donation.id} className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 bg-[color:var(--color-muted)] rounded-full flex items-center justify-center flex-shrink-0">
              <FiUser className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
            </div>

            {/* Donation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="font-medium text-sm px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    color: themeColor
                  }}
                >
                  {donation.name}
                </span>
                {donation.isTopDonor && (
                  <span 
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{
                      backgroundColor: `${themeColor}15`,
                      color: themeColor
                    }}
                  >
                    Top Donor
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--color-secondary-text)]">
                  donated {formatAmount(donation.amount)}
                </span>
                <span className="text-xs text-[color:var(--color-secondary-text)]">
                  {donation.timeAgo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See All Button */}
      {mockDonations.length > 4 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-lg border-2 font-medium transition-colors"
            style={{
              borderColor: themeColor,
              color: themeColor,
              backgroundColor: 'transparent'
            }}
          >
            {showAll ? 'Show Less' : 'See All Donations'}
          </button>
        </div>
      )}
    </div>
  );
}

export default RecentDonations;