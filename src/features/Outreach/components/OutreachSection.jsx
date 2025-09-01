import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Notification from "../../../components/Notification";
import OutreachHeader from "./OutreachHeader";
import CampaignOutreachAnalytics from "./CampaignOutreachAnalytics";
import SocialSharingIntegration from "./SocialSharingIntegration";
import { getCampaignAnalytics } from "../services/outreachApi";

const OutreachSection = ({ campaignId, campaignTitle, className = "" }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReachOut = () => {
    navigate(`/organizer/campaigns/${campaignId}/outreach`);
  };

  const handleAnalyticsRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCampaignAnalytics(campaignId);
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
    <div
      className={`bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mt-8 ${className}`}
    >
      <OutreachHeader title="Campaign Outreach" onReachOut={handleReachOut} />

      <CampaignOutreachAnalytics
        campaignId={campaignId}
        analytics={analytics}
        loading={loading}
        onRefresh={handleAnalyticsRefresh}
      />

      <SocialSharingIntegration
        campaignId={campaignId}
        campaignTitle={campaignTitle}
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
  );
};

export default OutreachSection;
