import React from "react";
import StatsCards from "../../../components/StatsCards";
import Buttons from "../../../components/Buttons";

const CampaignOutreachAnalytics = ({
  campaignId,
  analytics,
  loading,
  onRefresh,
}) => {
  const renderAnalyticsContent = () => {
    if (loading) {
      return (
        <div className="analytics-loading">
          <p>Loading analytics...</p>
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="analytics-empty">
          <p>No analytics data available</p>
          <Buttons onClick={onRefresh} variant="secondary" size="small">
            Refresh
          </Buttons>
        </div>
      );
    }

    return (
      <div className="analytics-content">
        <div className="analytics-header">
          <h4>Campaign Outreach Performance</h4>
          <Buttons onClick={onRefresh} variant="secondary" size="small">
            Refresh
          </Buttons>
        </div>

        <div className="analytics-metrics">
          <StatsCards
            stats={[
              {
                title: "Emails Sent",
                value: analytics.emailsSent || 0,
                change: "+0%",
                changeType: "positive",
              },
              {
                title: "Opens",
                value: analytics.opens || 0,
                change: "+0%",
                changeType: "positive",
              },
              {
                title: "Clicks",
                value: analytics.clicks || 0,
                change: "+0%",
                changeType: "positive",
              },
              {
                title: "Donations",
                value: analytics.donations || 0,
                change: "+0%",
                changeType: "positive",
              },
            ]}
          />
        </div>

        <div className="analytics-details">
          <div className="detail-section">
            <h5>Contact Engagement</h5>
            <p>Open Rate: {analytics.openRate || "0%"}</p>
            <p>Click Rate: {analytics.clickRate || "0%"}</p>
          </div>

          <div className="detail-section">
            <h5>Social Media</h5>
            <p>Shares: {analytics.shares || 0}</p>
            <p>Click-throughs: {analytics.socialClicks || 0}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="campaign-outreach-analytics">
      {renderAnalyticsContent()}
    </div>
  );
};

export default CampaignOutreachAnalytics;
