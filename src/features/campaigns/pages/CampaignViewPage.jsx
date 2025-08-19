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
// PreviewCollapse import removed during demolition
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
  const [approveLoading, setApproveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

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
  // Only the organizer (owner) can publish when status is pendingStart
  const isOwner =
    user?.userId &&
    campaign?.organizerId &&
    user.userId === campaign.organizerId;
  const canPublish = isOwner && status === "pendingStart";
  // Only admins can cancel campaigns
  const canCancel =
    status !== "pendingApproval" &&
    status !== "cancelled" &&
    status !== "rejected";

  const handleApprove = async () => {
    setActionError("");
    setApproveLoading(true);
    try {
      // Check if campaign should be active or pendingStart based on start date
      const now = new Date();
      const startDateRaw = campaign.startDate;
      const startDate = startDateRaw ? new Date(startDateRaw) : null;
      const hasValidStart = startDate && !isNaN(startDate.getTime());
      const newStatus =
        hasValidStart && startDate <= now ? "active" : "pendingStart";

      await updateCampaign(campaignId, { status: newStatus });
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
      setToastMessage(
        newStatus === "active"
          ? "Campaign approved and activated"
          : "Campaign approved and scheduled for start"
      );
      setToastType("success");
      setToastVisible(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Approval failed";
      setToastType("error");
      setToastMessage(msg);
      setToastVisible(true);
    } finally {
      setApproveLoading(false);
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
    if (reasonPurpose === "rejected") setRejectLoading(true);
    if (reasonPurpose === "cancelled") setCancelLoading(true);
    try {
      await updateCampaign(campaignId, {
        status: reasonPurpose,
        statusReason: note,
      });
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
      const successText =
        reasonPurpose === "rejected"
          ? "Campaign rejected successfully"
          : "Campaign cancelled successfully";
      setToastType("success");
      setToastMessage(successText);
      setToastVisible(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Action failed";
      setToastType("error");
      setToastMessage(msg);
      setToastVisible(true);
    } finally {
      setRejectLoading(false);
      setCancelLoading(false);
      setShowReason(false);
    }
  };

  const handlePublish = async () => {
    setActionError("");
    setPublishLoading(true);
    try {
      await publishPendingStartCampaign(campaignId);
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
      setToastType("success");
      setToastMessage("Campaign published successfully");
      setToastVisible(true);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Publishing failed";
      setToastType("error");
      setToastMessage(msg);
      setToastVisible(true);
    } finally {
      setPublishLoading(false);
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
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={4000}
      />
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <SecondaryButton onClick={() => navigate(-1)}>Go Back</SecondaryButton>
        <div className="flex gap-2"></div>
      </div>

      {/* Name and description */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-[color:var(--color-primary-text)] mb-2">
        {campaign.name}
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
          {/* Preview functionality removed during demolition */}

          {/* Approve/Reject (admins only when pendingApproval) */}
          {canApproveReject && (
            <div className="flex items-center gap-2">
              <PrimaryButton
                onClick={handleApprove}
                loading={approveLoading}
                disabled={approveLoading}
              >
                Approve
              </PrimaryButton>
              <SecondaryButton
                onClick={openReject}
                disabled={rejectLoading || cancelLoading}
              >
                Reject
              </SecondaryButton>
            </div>
          )}

          {/* Publish (organizers only when pendingStart) */}
          {canPublish && (
            <PrimaryButton
              onClick={handlePublish}
              loading={publishLoading}
              disabled={publishLoading}
            >
              Publish Campaign
            </PrimaryButton>
          )}

          {/* Cancel (both admin and organizer) */}
          {canCancel && (
            <SecondaryButton
              onClick={openCancel}
              disabled={rejectLoading || cancelLoading}
            >
              Cancel Campaign
            </SecondaryButton>
          )}
        </div>
        {/* Errors are shown via Notification; no inline error text */}
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
        confirmLoading={
          reasonPurpose === "rejected" ? rejectLoading : cancelLoading
        }
        onConfirm={handleReasonSubmit}
        onClose={() => setShowReason(false)}
      />

      {/* Placeholder for future analytics/sections */}
      <div className="mt-8 p-6 rounded-xl border border-[color:var(--color-muted)] bg-[color:var(--color-surface)] text-[color:var(--color-secondary-text)]">
        Additional analytics and details will appear here after approval.
      </div>

      {campaign.statusReason && (
        <div className="mt-6 p-6 rounded-xl border border-[color:var(--color-muted)] bg-[color:var(--color-surface)] text-[color:var(--color-secondary-text)]">
          <h3 className="text-lg font-bold mb-2">Status Reason</h3>
          <p className="whitespace-pre-wrap">{campaign.statusReason}</p>
        </div>
      )}
    </div>
  );
}
