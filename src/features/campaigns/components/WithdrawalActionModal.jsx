import React, { useState } from "react";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons";
import { FiX, FiCheck, FiXCircle, FiEye } from "react-icons/fi";
import Notification from "../../../components/Notification";

const WithdrawalActionModal = ({
  isOpen,
  onClose,
  withdrawal,
  onApprove,
  onReject,
  onViewCampaign,
  loading = false,
  isAdmin = false,
}) => {
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleAction = async (actionType) => {
    try {
      if (actionType === "approve") {
        const result = await onApprove(withdrawal.withdrawalRequestId, notes);

        // Check if payment was initiated
        if (result?.paymentInitiated) {
          setToastMessage(
            "Withdrawal approved and payment initiated successfully"
          );
          setToastType("success");
        } else {
          setToastMessage("Withdrawal approved successfully");
          setToastType("success");
        }
      } else if (actionType === "reject") {
        if (!reason.trim()) {
          setToastType("error");
          setToastMessage("Please provide a reason for rejection");
          setToastVisible(true);
          return;
        }
        await onReject(withdrawal.withdrawalRequestId, reason);
        setToastMessage("Withdrawal request rejected");
        setToastType("success");
      }
      setToastVisible(true);
      onClose();
    } catch (error) {
      setToastType("error");
      setToastMessage(
        error?.response?.data?.message || error?.message || "Action failed"
      );
      setToastVisible(true);
    }
  };

  const handleClose = () => {
    setAction(null);
    setNotes("");
    setReason("");
    onClose();
  };

  if (!isOpen || !withdrawal) return null;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "ZMW",
      }).format(amount);
    } catch {
      return `K${Number(amount).toFixed(2)}`;
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-blue-600 bg-blue-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "processing":
        return "text-purple-600 bg-purple-100";
      case "paid":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "processing":
        return "🔄";
      case "paid":
        return "💰";
      case "failed":
        return "⚠️";
      default:
        return "❓";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "pending":
        return "Awaiting admin approval";
      case "approved":
        return "Approved, payment initiated";
      case "rejected":
        return "Request rejected";
      case "processing":
        return "Payment being processed";
      case "paid":
        return "Payment completed successfully";
      case "failed":
        return "Payment failed";
      default:
        return "Unknown status";
    }
  };

  return (
    <>
      <Notification
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={4000}
      />
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[color:var(--color-primary-text)]">
              Withdrawal Request Details
            </h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[color:var(--color-surface)] rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-[color:var(--color-secondary-text)]" />
            </button>
          </div>

          {/* Withdrawal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
                  Campaign
                </label>
                <p className="text-[color:var(--color-primary-text)]">
                  {withdrawal.campaignName || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
                  Organizer
                </label>
                <p className="text-[color:var(--color-primary-text)]">
                  {withdrawal.organizerName || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
                  Amount
                </label>
                <p className="text-[color:var(--color-primary-text)] font-semibold">
                  {formatCurrency(withdrawal.amount)} {withdrawal.currency}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      withdrawal.status
                    )}`}
                  >
                    <span className="mr-1">
                      {getStatusIcon(withdrawal.status)}
                    </span>
                    {withdrawal.status?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[color:var(--color-secondary-text)] mt-1">
                  {getStatusDescription(withdrawal.status)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
                  Destination
                </label>
                <p className="text-[color:var(--color-primary-text)]">
                  {withdrawal.destination?.phoneNumber || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
                  Request Date
                </label>
                <p className="text-[color:var(--color-primary-text)]">
                  {formatDate(withdrawal.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Information */}
          {withdrawal.status === "processing" && (
            <div className="mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-purple-800 font-medium">
                    Payment Processing
                  </span>
                </div>
                <p className="text-purple-700 text-sm">
                  Your withdrawal is being processed by our payment provider.
                  This typically takes 5-15 minutes. You'll receive a
                  notification once completed.
                </p>
              </div>
            </div>
          )}

          {/* Success Information */}
          {withdrawal.status === "paid" && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 text-lg">✅</span>
                  <span className="text-green-800 font-medium">
                    Payment Completed
                  </span>
                </div>
                <p className="text-green-700 text-sm">
                  Your withdrawal has been successfully processed. Check your
                  mobile money account to confirm receipt.
                </p>
              </div>
            </div>
          )}

          {/* Failure Information */}
          {withdrawal.status === "failed" && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 text-lg">⚠️</span>
                  <span className="text-red-800 font-medium">
                    Payment Failed
                  </span>
                </div>
                <p className="text-red-700 text-sm">
                  Your withdrawal could not be processed. Please contact support
                  for assistance.
                </p>
              </div>
            </div>
          )}

          {/* Rejection Information */}
          {withdrawal.status === "rejected" && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 text-lg">❌</span>
                  <span className="text-red-800 font-medium">
                    Withdrawal Rejected
                  </span>
                </div>
                <p className="text-red-700 text-sm">
                  Your withdrawal request has been rejected. Please review the
                  reason below and contact support if you need assistance.
                </p>
                {withdrawal.notes && (
                  <div className="mt-3 p-3 bg-white border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700">{withdrawal.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {withdrawal.notes && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
                Notes
              </label>
              <p className="text-[color:var(--color-primary-text)] bg-[color:var(--color-surface)] p-3 rounded-lg">
                {withdrawal.notes}
              </p>
            </div>
          )}

          {/* Action Forms */}
          {withdrawal.status === "pending" && (
            <div className="space-y-4">
              {action === "approve" && (
                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-2">
                    Approval Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-[color:var(--color-muted)] rounded-lg px-3 py-2 bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
                    rows={3}
                    placeholder="Add any notes about this approval..."
                  />
                </div>
              )}

              {action === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-[color:var(--color-muted)] rounded-lg px-3 py-2 bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]"
                    rows={3}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-[color:var(--color-muted)]">
            <SecondaryButton
              icon={FiEye}
              onClick={() => onViewCampaign(withdrawal.campaignId)}
            >
              View Campaign
            </SecondaryButton>

            {withdrawal.status === "pending" && isAdmin && (
              <>
                {action === "approve" ? (
                  <PrimaryButton
                    icon={FiCheck}
                    onClick={() => handleAction("approve")}
                    loading={loading}
                    disabled={loading}
                  >
                    Confirm Approval
                  </PrimaryButton>
                ) : action === "reject" ? (
                  <PrimaryButton
                    icon={FiXCircle}
                    onClick={() => handleAction("reject")}
                    loading={loading}
                    disabled={loading || !reason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirm Rejection
                  </PrimaryButton>
                ) : (
                  <>
                    <PrimaryButton
                      icon={FiCheck}
                      onClick={() => setAction("approve")}
                    >
                      Approve
                    </PrimaryButton>
                    <PrimaryButton
                      icon={FiXCircle}
                      onClick={() => setAction("reject")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </PrimaryButton>
                  </>
                )}
              </>
            )}

            <SecondaryButton onClick={handleClose}>Close</SecondaryButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawalActionModal;
