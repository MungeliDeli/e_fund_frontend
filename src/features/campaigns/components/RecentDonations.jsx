import React, { useEffect, useMemo, useState } from "react";
import { FiAward, FiUser } from "react-icons/fi";
import { getDonationsByCampaign as fetchDonationsByCampaign } from "../../donations/services/donationsApi";

function RecentDonations({ themeColor, campaignId }) {
  const [showAll, setShowAll] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!campaignId) return;
      try {
        setLoading(true);
        setError("");
        const res = await fetchDonationsByCampaign(campaignId, {
          limit: 100,
          offset: 0,
        });
        // Backend responses vary between returning data directly or under data.data
        const rows = res?.data?.data || res?.data || res || [];
        setDonations(Array.isArray(rows) ? rows : []);
      } catch (e) {
        setError(e?.message || "Failed to load donations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId]);

  const sortedByAmountDesc = useMemo(() => {
    return [...donations]
      .filter((d) => d && d.amount != null)
      .sort((a, b) => Number(b.amount) - Number(a.amount));
  }, [donations]);

  const topTwoDonors = useMemo(
    () => sortedByAmountDesc.slice(0, 2),
    [sortedByAmountDesc]
  );

  const remainingByRecent = useMemo(() => {
    const ids = new Set(topTwoDonors.map((d) => d.donationId));
    return donations
      .filter((d) => !ids.has(d.donationId))
      .sort(
        (a, b) =>
          new Date(b.donationDate).getTime() -
          new Date(a.donationDate).getTime()
      );
  }, [donations, topTwoDonors]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const displayList = useMemo(() => {
    const recentSlice = showAll
      ? remainingByRecent
      : remainingByRecent.slice(0, 4);
    return [...topTwoDonors, ...recentSlice];
  }, [topTwoDonors, remainingByRecent, showAll]);

  // Hide entire component when no donations to show
  if (!loading && !error && displayList.length === 0) {
    return null;
  }

  return (
    <div className="bg-[color:var(--color-background)] rounded-lg p-6 shadow-[0_2px_16px_0_var(--color-shadow)] ">
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
      {loading && (
        <div className="text-sm text-[color:var(--color-secondary-text)]">
          Loading...
        </div>
      )}
      {error && !loading && <div className="text-sm text-red-500">{error}</div>}
      <div className="space-y-3">
        {displayList.map((donation, index) => (
          <div
            key={donation.donationId || `${donation.amount}-${index}`}
            className="flex items-center gap-3"
          >
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
                  <span className="text-sm text-[color:var(--color-text)]">
                    {(donation.isAnonymous
                      ? "Anonymous"
                      : donation.donorName) || "Donor"}{" "}
                    donated{" "}
                    <span className="font-bold">
                      {formatAmount(donation.amount)}
                    </span>
                  </span>
                </div>
                {index < 2 && (
                  <span
                    className="text-xs px-2 py-1 rounded font-medium flex items-center gap-1"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      color: themeColor,
                    }}
                  >
                    <FiAward className="w-3 h-3" /> Top Donor
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
            backgroundColor: "bg-[color:var(--color-background)]",
          }}
        >
          {showAll ? "Show less" : "See all Donations"}
        </button>
      </div>
    </div>
  );
}

export default RecentDonations;
