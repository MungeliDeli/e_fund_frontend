import React from "react";
import { SecondaryButton } from "../../../components/Buttons";

const CampaignOutreachAnalytics = ({
  campaignId,
  analytics,
  loading,
  onRefresh,
}) => {
  const renderAnalyticsContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8 text-[color:var(--color-secondary-text)]">
          <p>Loading analytics...</p>
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="text-center py-8 text-[color:var(--color-secondary-text)]">
          <p>No analytics data available</p>
          <SecondaryButton onClick={onRefresh}>Refresh</SecondaryButton>
        </div>
      );
    }

    return (
      <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-5">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5">
          <h4 className="text-xl font-semibold text-[color:var(--color-primary-text)] m-0">
            Campaign Outreach Performance
          </h4>
          <SecondaryButton onClick={onRefresh}>Refresh</SecondaryButton>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center">
              <h5 className="text-sm font-medium text-[color:var(--color-secondary-text)] mb-2 m-0">
                Emails Sent
              </h5>
              <div className="text-3xl font-bold text-[color:var(--color-primary-text)]">
                {analytics.emailsSent || 0}
              </div>
            </div>
            <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center">
              <h5 className="text-sm font-medium text-[color:var(--color-secondary-text)] mb-2 m-0">
                Opens
              </h5>
              <div className="text-3xl font-bold text-[color:var(--color-primary-text)]">
                {analytics.opens || 0}
              </div>
            </div>
            <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center">
              <h5 className="text-sm font-medium text-[color:var(--color-secondary-text)] mb-2 m-0">
                Clicks
              </h5>
              <div className="text-3xl font-bold text-[color:var(--color-primary-text)]">
                {analytics.clicks || 0}
              </div>
            </div>
            <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center">
              <h5 className="text-sm font-medium text-[color:var(--color-secondary-text)] mb-2 m-0">
                Donations
              </h5>
              <div className="text-3xl font-bold text-[color:var(--color-primary-text)]">
                {analytics.donations || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <h5 className="text-base font-semibold text-[color:var(--color-primary-text)] mb-2 m-0">
              Contact Engagement
            </h5>
            <p className="text-[color:var(--color-secondary-text)] my-1">
              Open Rate: {analytics.openRate || "0%"}
            </p>
            <p className="text-[color:var(--color-secondary-text)] my-1">
              Click Rate: {analytics.clickRate || "0%"}
            </p>
          </div>

          <div>
            <h5 className="text-base font-semibold text-[color:var(--color-primary-text)] mb-2 m-0">
              Social Media
            </h5>
            <p className="text-[color:var(--color-secondary-text)] my-1">
              Shares: {analytics.shares || 0}
            </p>
            <p className="text-[color:var(--color-secondary-text)] my-1">
              Click-throughs: {analytics.socialClicks || 0}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return <div className="mb-6">{renderAnalyticsContent()}</div>;
};

export default CampaignOutreachAnalytics;
