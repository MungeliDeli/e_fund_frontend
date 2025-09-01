import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Notification from "../../../components/Notification";
import OutreachHeader from "./OutreachHeader";
import CampaignOutreachAnalytics from "./CampaignOutreachAnalytics";
import SocialSharingIntegration from "./SocialSharingIntegration";
import "./OutreachSection.css";

const OutreachSection = ({ campaignId, campaignTitle }) => {
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
      // TODO: Implement analytics API call
      // const data = await outreachApi.getCampaignAnalytics(campaignId);
      // setAnalytics(data);
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
    <div className="outreach-section">
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

      {error && <Notification type="error" message={error} duration={5000} />}
    </div>
  );
};

export default OutreachSection;
