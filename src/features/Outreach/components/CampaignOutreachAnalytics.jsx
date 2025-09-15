import React from "react";
import MetaCard from "../../campaigns/components/MetaCard";
import {
  FiMail,
  FiEye,
  FiMousePointer,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";
import { FiLayers } from "react-icons/fi";

const CampaignOutreachAnalytics = ({ campaignId, analytics, loading }) => {

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "-";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "k",
    }).format(amount);
  } catch {
    return `K${Number(amount).toFixed(2)}`;
  }
}

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
        </div>
      );
    }

    return (
      <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-5">
        <div className="flex flex-col gap-4 mb-5">
          <h4 className="text-xl font-semibold text-[color:var(--color-primary-text)] m-0">
            Campaign Outreach Performance
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-5">
          <MetaCard
            title="Outreach Campaigns"
            value={analytics.outreachCampaigns || 0}
            Icon={FiLayers}
            color="#0ea5e9"
          />
          <MetaCard
            title="Emails Sent"
            value={analytics.emailsSent || 0}
            Icon={FiMail}
            color="#6366f1"
          />
          <MetaCard
            title="Opens"
            value={analytics.opens || 0}
            Icon={FiEye}
            color="#f59e0b"
          />
          <MetaCard
            title="Clicks"
            value={analytics.clicks || 0}
            Icon={FiMousePointer}
            color="#a855f7"
          />
          <MetaCard
            title="Donations"
            value={analytics.donations || 0}
            Icon={FiUsers}
            color="#10b981"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetaCard
            title="Open Rate"
            value={analytics.openRate || "0%"}
            Icon={FiEye}
            color="#22c55e"
          />
          <MetaCard
            title="Click Rate"
            value={analytics.clickRate || "0%"}
            Icon={FiMousePointer}
            color="#eab308"
          />
          <MetaCard
            title="Revenue"
            value={formatCurrency(analytics.revenue || 0)}
            Icon={FiDollarSign}
            color="#10b981"
          />
        </div>
      </div>
    );
  };

  return <div className="mb-6">{renderAnalyticsContent()}</div>;
};

export default CampaignOutreachAnalytics;
