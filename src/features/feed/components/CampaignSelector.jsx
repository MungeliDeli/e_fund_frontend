import React from "react";

const CampaignSelector = ({
  campaigns,
  loading,
  selectedCampaignId,
  onCampaignChange,
  error,
}) => {
  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          Campaign (Optional)
        </label>
        <div className="animate-pulse bg-[var(--color-muted)] h-10 rounded-md"></div>
      </div>
    );
  }

  const organizerCampaigns = Array.isArray(campaigns)
    ? campaigns.filter((campaign) => campaign.status == "active" || campaigns.status === "successful")
    : [];


  return (
    <div>
      <label
        htmlFor="campaignId"
        className="block text-sm font-medium text-[var(--color-text)] mb-2"
      >
        Campaign (Optional)
      </label>
      <select
        id="campaignId"
        value={selectedCampaignId}
        onChange={(e) => onCampaignChange(e.target.value)}
        className="w-full px-3 py-2 border border-[var(--color-muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background)] text-[var(--color-text)]"
      >
        <option value="">Standalone post</option>
        {organizerCampaigns.map((campaign) => (
          <option key={campaign.campaignId} value={campaign.campaignId}>
            {campaign.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {organizerCampaigns.length === 0 && (
        <p className="mt-2 text-sm text-[var(--color-secondary-text)]">
          You don't have any published campaigns yet. This post will be
          standalone.
        </p>
      )}
    </div>
  );
};

export default CampaignSelector;
