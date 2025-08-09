import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCampaignById,
  updateCampaign,
} from "../../campaigns/services/campaignApi";
import { useAuth } from "../../../contexts/AuthContext";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons";
import MetaCard from "../components/MetaCard";
import ReasonModal from "../components/ReasonModal";
import PreviewCollapse from "../components/PreviewCollapse";
import { FaBullseye, FaRegCalendarCheck } from "react-icons/fa";
import { FiCalendar, FiFlag } from "react-icons/fi";

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
  "super_admin",
  "support_admin",
  "event_moderator",
  "financial_admin",
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
  const canApproveReject = isAdmin && status === "pending";
  const canCancel = status !== "pending" && status !== "cancelled"; // admin or organizer; organizer shares this page

  const handleApprove = async () => {
    try {
      await updateCampaign(campaignId, { status: "active" });
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
    } catch (e) {
      console.error(e);
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
    try {
      await updateCampaign(campaignId, {
        status: reasonPurpose /* statusNote planned */,
      });
      const refreshed = await getCampaignById(campaignId);
      setCampaign(refreshed.data || refreshed);
    } catch (e) {
      console.error(e);
    } finally {
      setShowReason(false);
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
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Preview toggle */}
        {campaign.templateId && (
          <PreviewCollapse
            templateId={campaign.templateId}
            customPageSettings={campaign.customPageSettings}
          />
        )}

        {/* Approve/Reject (admins only when pending) */}
        {canApproveReject && (
          <div className="flex gap-2">
            <PrimaryButton onClick={handleApprove}>Approve</PrimaryButton>
            <SecondaryButton onClick={openReject}>Reject</SecondaryButton>
          </div>
        )}

        {/* Cancel (both admin and organizer) */}
        {canCancel && (
          <SecondaryButton onClick={openCancel}>
            Cancel Campaign
          </SecondaryButton>
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
