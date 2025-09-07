import React from "react";
import { PrimaryButton } from "../../../components/Buttons";
import { FiShare2 } from "react-icons/fi";

const OutreachHeader = ({
  title,
  onReachOut,
  onSocialShare,
  onManageCampaigns,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <h3 className="text-2xl font-semibold text-[color:var(--color-primary-text)] m-0">
          {title}
        </h3>
        <div className="flex justify-center sm:justify-start gap-3">
          <button
            onClick={onSocialShare}
            className="px-4 py-2 border border-[color:var(--color-muted)] rounded-lg font-medium text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors flex items-center gap-2"
          >
            <FiShare2 className="w-4 h-4" />
            Share
          </button>
          {onManageCampaigns && (
            <button
              onClick={onManageCampaigns}
              className="px-4 py-2 border border-[color:var(--color-muted)] rounded-lg font-medium text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            >
              Manage Campaigns
            </button>
          )}
          <PrimaryButton onClick={onReachOut}>Send Invitations</PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default OutreachHeader;
