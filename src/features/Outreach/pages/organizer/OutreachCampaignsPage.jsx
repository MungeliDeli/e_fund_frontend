import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import Notification from "../../../../components/Notification";
import {
  listOutreachCampaigns,
  archiveOutreachCampaign,
} from "../../services/outreachApi";
import { getCampaignById } from "../../../campaigns/services/campaignApi";
import StatusBadge from "../../../../components/StatusBadge";

const OutreachCampaignsPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [campaign, setCampaign] = useState(null);
  const [outreachCampaigns, setOutreachCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [archiving, setArchiving] = useState(null);

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
      loadOutreachCampaigns();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const campaignData = await getCampaignById(campaignId);
      setCampaign(campaignData.data);
    } catch (err) {
      setError(err.message || "Failed to load campaign details");
    }
  };

  const loadOutreachCampaigns = async () => {
    try {
      setLoading(true);
      const campaignsData = await listOutreachCampaigns(campaignId);

      const campaigns = Array.isArray(campaignsData)
        ? campaignsData
        : campaignsData?.data || [];

      setOutreachCampaigns(campaigns);
    } catch (err) {
      setError(err.message || "Failed to load outreach campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveCampaign = async (outreachCampaignId) => {
    if (
      !window.confirm(
        "Are you sure you want to archive this outreach campaign?"
      )
    ) {
      return;
    }

    try {
      setArchiving(outreachCampaignId);
      await archiveOutreachCampaign(outreachCampaignId);

      setSuccess("Outreach campaign archived successfully");
      loadOutreachCampaigns(); // Refresh the list
    } catch (err) {
      setError(err.message || "Failed to archive outreach campaign");
    } finally {
      setArchiving(null);
    }
  };

  const getStatusColor = () => ""; // deprecated: replaced by StatusBadge

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
                Outreach Campaigns
              </h1>
              <p className="text-[color:var(--color-secondary-text)] mt-2">
                Manage outreach campaigns for{" "}
                {campaign?.name || "this campaign"}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/campaigns/${campaignId}`}
                className="px-4 py-2 text-[color:var(--color-text)] border border-[color:var(--color-muted)] rounded-lg hover:bg-[color:var(--color-surface)] transition-colors"
              >
                Back to Campaign
              </Link>
              <Link
                to={`/campaigns/${campaignId}/outreach/compose`}
                className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-primary)]/90 transition-colors"
              >
                Add Outreach Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Campaign Context */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mb-8">
          <div className="text-[color:var(--color-secondary-text)]">
            {campaign ? (
              <>
                <div className="text-lg font-medium text-[color:var(--color-text)] mb-1">
                  {campaign.name}
                </div>
                <div className="text-sm">
                  {campaign.description || "No description available"}
                </div>
              </>
            ) : (
              <div>Loading campaign details...</div>
            )}
          </div>
        </div>

        {/* Outreach Campaigns List */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
              Outreach Campaigns ({outreachCampaigns.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-[color:var(--color-secondary-text)]">
                Loading outreach campaigns...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={loadOutreachCampaigns}
                className="px-4 py-2 bg-[color:var(--color-accent)] text-white rounded-lg hover:bg-[color:var(--color-accent)]/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : outreachCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-[color:var(--color-secondary-text)] mb-4">
                No outreach campaigns found for this campaign.
              </div>
              <Link
                to={`/campaigns/${campaignId}/outreach/compose`}
                className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-primary)]/90 transition-colors"
              >
                Create Your First Outreach Campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {outreachCampaigns.map((outreachCampaign) => (
                <div
                  key={outreachCampaign.outreachCampaignId}
                  className="border border-[color:var(--color-muted)] bg-[color:var(--color-background)] rounded-lg p-6 hover:bg-[color:var(--color-surface)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-[color:var(--color-text)]">
                          {outreachCampaign.name}
                        </h3>
                        <StatusBadge status={outreachCampaign.status} />
                      </div>

                      {outreachCampaign.description && (
                        <p className="text-[color:var(--color-secondary-text)] mb-3">
                          {outreachCampaign.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-[color:var(--color-secondary-text)]">
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(outreachCampaign.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span>{" "}
                          {formatDate(outreachCampaign.updatedAt)}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      {outreachCampaign.totals && (
                        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                          <div className="text-[color:var(--color-secondary-text)]">
                            <span className="font-medium text-[color:var(--color-text)]">
                              {outreachCampaign.totals.recipients || 0}
                            </span>{" "}
                            recipients
                          </div>
                          <div className="text-[color:var(--color-secondary-text)]">
                            <span className="font-medium text-[color:var(--color-text)]">
                              {outreachCampaign.totals.sends || 0}
                            </span>{" "}
                            sent
                          </div>
                          <div className="text-[color:var(--color-secondary-text)]">
                            <span className="font-medium text-[color:var(--color-text)]">
                              {outreachCampaign.totals.uniqueOpens || 0}
                            </span>{" "}
                            opened
                          </div>
                          <div className="text-[color:var(--color-secondary-text)]">
                            <span className="font-medium text-[color:var(--color-text)]">
                              {outreachCampaign.totals.uniqueClicks || 0}
                            </span>{" "}
                            clicked
                          </div>
                          <div className="text-[color:var(--color-secondary-text)]">
                            <span className="font-medium text-[color:var(--color-text)]">
                              {outreachCampaign.totals.donations || 0}
                            </span>{" "}
                            donations
                          </div>
                          <div className="text-[color:var(--color-secondary-text)]">
                            <span className="font-medium text-[color:var(--color-text)]">
                              ${outreachCampaign.totals.totalAmount || 0}
                            </span>{" "}
                            raised
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/organizer/outreach-campaigns/${outreachCampaign.outreachCampaignId}`}
                        className="px-3 py-1 text-sm bg-[color:var(--color-accent)] text-white rounded hover:bg-[color:var(--color-accent)]/90 transition-colors"
                      >
                        View Details
                      </Link>
                      {outreachCampaign.status !== "archived" && (
                        <button
                          onClick={() =>
                            handleArchiveCampaign(
                              outreachCampaign.outreachCampaignId
                            )
                          }
                          disabled={
                            archiving === outreachCampaign.outreachCampaignId
                          }
                          className="px-3 py-1 text-sm text-[color:var(--color-text)] border border-[color:var(--color-muted)] rounded hover:bg-[color:var(--color-surface)] transition-colors disabled:opacity-50"
                        >
                          {archiving === outreachCampaign.outreachCampaignId
                            ? "Archiving..."
                            : "Archive"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Notification
          type="error"
          message={error}
          isVisible={!!error}
          onClose={() => setError(null)}
          duration={5000}
        />
      )}

      {success && (
        <Notification
          type="success"
          message={success}
          isVisible={!!success}
          onClose={() => setSuccess(null)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default OutreachCampaignsPage;
