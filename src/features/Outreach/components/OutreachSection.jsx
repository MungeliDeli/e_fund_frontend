import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Notification from "../../../components/Notification";
import OutreachHeader from "./OutreachHeader";
import CampaignOutreachAnalytics from "./CampaignOutreachAnalytics";
import MetaCard from "../../campaigns/components/MetaCard";
import { FiMail, FiEye, FiMousePointer, FiUsers } from "react-icons/fi";
import { FiLayers } from "react-icons/fi";
import { getCampaignAnalytics } from "../services/outreachApi";

const OutreachSection = ({ campaignId, campaignTitle, className = "" }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReachOut = () => {
    navigate(`/campaigns/${campaignId}/outreach/compose`);
  };

  const handleManageCampaigns = () => {
    navigate(`/organizer/campaigns/${campaignId}/outreach-campaigns`);
  };

  // Social sharing removed

  const [filters, setFilters] = useState({ dateRange: "30d", type: "all" });

  const handleAnalyticsRefresh = async (overrideFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCampaignAnalytics(
        campaignId,
        overrideFilters || filters
      );
      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      handleAnalyticsRefresh();
    }
  }, [campaignId]);

  if (!user) {
    return null;
  }

  return (
    <>
      <div
        className={`bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mt-8 ${className}`}
      >
        <OutreachHeader
          title="Campaign Outreach"
          onReachOut={handleReachOut}
          onManageCampaigns={handleManageCampaigns}
        />

        <CampaignOutreachAnalytics
          campaignId={campaignId}
          analytics={analytics}
          loading={loading}
          onRefresh={() => handleAnalyticsRefresh()}
          onFilterChange={(partial) => {
            const next = { ...filters, ...partial };
            setFilters(next);
            handleAnalyticsRefresh(next);
          }}
        />

        {error && (
          <Notification
            type="error"
            message={error}
            isVisible={!!error}
            onClose={() => setError(null)}
            duration={5000}
          />
        )}
      </div>

      {/* SocialSharingModal intentionally not rendered */}
    </>
  );
};

export default OutreachSection;
