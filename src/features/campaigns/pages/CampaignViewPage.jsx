import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaignById,
  updateCampaign,
  publishPendingStartCampaign,
} from "../../campaigns/services/campaignApi";
import { useAuth } from "../../../contexts/AuthContext";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons";
import MetaCard from "../components/MetaCard";
import ReasonModal from "../components/ReasonModal";
import PreviewCollapse from "../components/PreviewCollapse";
import { FaBullseye, FaRegCalendarCheck } from "react-icons/fa";
import { FiCalendar, FiFlag } from "react-icons/fi";
import Notification from "../../../components/Notification";

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "-";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

const ADMIN_ROLES = [
  "superAdmin",
  "supportAdmin",
  "eventModerator",
  "financialAdmin",
];

export default function CampaignViewPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [showReason, setShowReason] = useState(false);
  const [reasonPurpose, setReasonPurpose] = useState("rejected"); // 'rejected' | 'cancelled'
  const isAdmin = ADMIN_ROLES.includes(user?.userType);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getCampaignById(campaignId);
        const data = res.data || res; // API format compatibility
        if (mounted) setCampaign(data);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load campaign");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [campaignId]);

  const status = campaign?.status;
  const canApproveReject = isAdmin && status === "pendingApproval";
  const canPublish = status === "pendingStart"; // organizer can publish their own pendingStart campaigns
  const canCancel = status !== "pendingApproval" && status !== "cancelled"; // admin or organizer; organizer shares this page

  const handleApprove = async () => {
    setActionError("");
    setActionLoading(true);
    try {
      // Check if campaign should be active or pendingStart based on start date
      const now = new Date();
      const startDate = new Date(campaign.startDate);
      const newStatus = startDate <= now ? "active" : "pendingStart";

      await updateCampaign(campaignId, { status: newStatus });
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
      setToastMessage(
        newStatus === "active"
          ? "Campaign approved and activated"
          : "Campaign approved and scheduled for start"
      );
      setToastVisible(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Approval failed";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = () => {
    setReasonPurpose("rejected");
    setShowReason(true);
  };
  const openCancel = () => {
    setReasonPurpose("cancelled");
    setShowReason(true);
  };
  const handleReasonSubmit = async (note) => {
    setActionError("");
    setActionLoading(true);
    try {
      await updateCampaign(campaignId, {
        status: reasonPurpose /* statusNote planned */,
      });
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
      const successText =
        reasonPurpose === "rejected"
          ? "Campaign rejected successfully"
          : "Campaign cancelled successfully";
      setToastMessage(successText);
      setToastVisible(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Action failed";
      setActionError(msg);
    } finally {
      setActionLoading(false);
      setShowReason(false);
    }
  };

  const handlePublish = async () => {
    setActionError("");
    setActionLoading(true);
    try {
      await publishPendingStartCampaign(campaignId);
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
      setToastMessage("Campaign published successfully");
      setToastVisible(true);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Publishing failed";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error || !campaign) {
    return (
      <div className="p-6 text-red-500">{error || "Campaign not found"}</div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Notification
        type="success"
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={4000}
      />
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <SecondaryButton onClick={() => navigate(-1)}>Go Back</SecondaryButton>
        <div className="flex gap-2">{campaign.templateId && <></>}</div>
      </div>

      {/* Title and description */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-[color:var(--color-primary-text)] mb-2">
        {campaign.title}
      </h1>
      <p className="text-[color:var(--color-secondary-text)] mb-6 max-w-3xl">
        {campaign.description}
      </p>

      {/* Meta cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetaCard
          title="Goal"
          value={formatCurrency(campaign.goalAmount)}
          Icon={FaBullseye}
          color="#43e97b"
        />
        <MetaCard
          title="Start Date"
          value={formatDate(campaign.startDate)}
          Icon={FiCalendar}
          color="#3b82f6"
        />
        <MetaCard
          title="End Date"
          value={formatDate(campaign.endDate)}
          Icon={FaRegCalendarCheck}
          color="#ef4444"
        />
        <MetaCard
          title="Status"
          value={campaign.status}
          Icon={FiFlag}
          color="#a855f7"
        />
      </div>

      {/* Actions row */}
      <div className="mb-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Preview toggle */}
          {campaign.templateId && (
            <PreviewCollapse
              templateId={campaign.templateId}
              customPageSettings={campaign.customPageSettings}
            />
          )}

          {/* Approve/Reject (admins only when pendingApproval) */}
          {canApproveReject && (
            <div className="flex items-center gap-2">
              <PrimaryButton onClick={handleApprove} disabled={actionLoading}>
                Approve
              </PrimaryButton>
              <SecondaryButton onClick={openReject} disabled={actionLoading}>
                Reject
              </SecondaryButton>
            </div>
          )}

          {/* Publish (organizers only when pendingStart) */}
          {canPublish && (
            <PrimaryButton onClick={handlePublish} disabled={actionLoading}>
              Publish Campaign
            </PrimaryButton>
          )}

          {/* Cancel (both admin and organizer) */}
          {canCancel && (
            <SecondaryButton onClick={openCancel} disabled={actionLoading}>
              Cancel Campaign
            </SecondaryButton>
          )}
        </div>
        {actionError && (
          <div className="mt-2 text-sm text-red-500">{actionError}</div>
        )}
      </div>

      {/* Reason Modal for reject/cancel */}
      <ReasonModal
        isOpen={showReason}
        title={
          reasonPurpose === "rejected"
            ? "Reason for Rejection"
            : "Reason for Cancellation"
        }
        placeholder={
          reasonPurpose === "rejected"
            ? "Why is this campaign rejected?"
            : "Why cancel this campaign?"
        }
        confirmText={reasonPurpose === "rejected" ? "Reject" : "Cancel"}
        onConfirm={handleReasonSubmit}
        onClose={() => setShowReason(false)}
      />

      {/* Placeholder for future analytics/sections */}
      <div className="mt-8 p-6 rounded-xl border border-[color:var(--color-muted)] bg-[color:var(--color-surface)] text-[color:var(--color-secondary-text)]">
        Additional analytics and details will appear here after approval.
      </div>
    </div>
  );
}
