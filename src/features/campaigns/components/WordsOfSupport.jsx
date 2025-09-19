import React, { useEffect, useMemo, useState } from "react";
import {
  getFeaturedMessages,
  getMessagesByCampaign,
} from "../../donations/services/messagesApi";

function WordsOfSupport({ themeColor, campaignId }) {
  const [showCount, setShowCount] = useState(3);
  const [featured, setFeatured] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!campaignId) return;
      try {
        setLoading(true);
        setError("");
        const [featRes, approvedRes] = await Promise.all([
          getFeaturedMessages(campaignId, 10),
          getMessagesByCampaign(campaignId, {
            status: "approved",
            limit: 100,
            offset: 0,
          }),
        ]);

        const feat = featRes?.data || featRes || [];
        const appr = approvedRes?.data || approvedRes || [];
        setFeatured(Array.isArray(feat) ? feat : []);
        setApproved(Array.isArray(appr) ? appr : []);
      } catch (e) {
        setError(e?.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId]);

  const mergedMessages = useMemo(() => {
    const byId = new Set((featured || []).map((m) => m.messageId));
    const rest = (approved || [])
      .filter((m) => m.status === "approved" && !byId.has(m.messageId))
      .sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    const featSorted = (featured || [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    return [...featSorted, ...rest];
  }, [featured, approved]);

  const displayedSupports = useMemo(
    () => mergedMessages.slice(0, showCount),
    [mergedMessages, showCount]
  );

  const handleSeeMore = () => {
    setShowCount((prev) => Math.min(prev + 5, mergedMessages.length));
  };

  // Hide entire component when there are no messages
  if (!loading && !error && mergedMessages.length === 0) {
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
          Words of Support
        </h3>
        <div
          className="w-full h-px"
          style={{ backgroundColor: `${themeColor}40` }}
        ></div>
      </div>

      {/* Support Messages */}
      {loading && (
        <div className="text-sm text-[color:var(--color-secondary-text)]">
          Loading...
        </div>
      )}
      {error && !loading && <div className="text-sm text-red-500">{error}</div>}
      <div className="space-y-4">
        {displayedSupports.map((support) => (
          <div
            key={support.messageId}
            className="bg-[color:var(--color-surface)] p-4 rounded-lg border border-[color:var(--color-muted)]"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Message and Author */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[color:var(--color-text)] font-normal leading-relaxed mb-2">
                  "{support.messageText}"
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: themeColor }}
                >
                  -{" "}
                  {support.isAnonymous
                    ? "Anonymous"
                    : support.donorEmail || "Supporter"}
                </p>
              </div>

              {/* Featured Badge */}
              {support.isFeatured && (
                <div
                  className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${themeColor}20`,
                    color: themeColor,
                  }}
                >
                  Featured
                </div>
              )}
            </div>
          </div>
        ))}
        {!loading && !error && mergedMessages.length === 0 && (
          <div className="text-sm text-[color:var(--color-secondary-text)]">
            No messages yet.
          </div>
        )}
      </div>

      {/* See More Button */}
      <div className="mt-4 text-center">
        <button
          onClick={handleSeeMore}
          className="w-full py-2 px-4 rounded-lg border-2 font-medium transition-colors"
          style={{
            borderColor: `${themeColor}40`,
            color: themeColor,
            backgroundColor: "bg-[color:var(--color-background)]",
          }}
        >
          See More
        </button>
      </div>
    </div>
  );
}

export default WordsOfSupport;
