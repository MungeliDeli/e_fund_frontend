import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Notification from "../../../../components/Notification";
import EntityFormModal from "../../../../components/EntityFormModal";
import Table from "../../../../components/Table";
import { FiMail, FiEye, FiMousePointer, FiDollarSign } from "react-icons/fi";
import { FaRegCalendarCheck } from "react-icons/fa";
import {
  getOutreachCampaign,
  resendFailedInvitations,
  sendOutreachInvitations,
} from "../../services/outreachApi";

const number = (v) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(v || 0);
  } catch {
    return `$${Number(v || 0).toFixed(2)}`;
  }
};

const OutreachCampaignDetailPage = () => {
  const { outreachCampaignId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendValidation, setSendValidation] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOutreachCampaign(outreachCampaignId);
      const data = res.data || res;
      setCampaign(data);
      setRecipients(Array.isArray(data.recipients) ? data.recipients : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outreachCampaignId) load();
  }, [outreachCampaignId]);

  const handleOpenSend = () => {
    setSendValidation(null);
    setShowSendModal(true);
  };

  const handleConfirmSend = async () => {
    if (!sendMessage.trim()) {
      setSendValidation("Please enter a personalized message");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const payload = {
        campaignId: campaign.campaignId,
        recipients: recipients
          .filter((r) => r.email)
          .map((r) => ({ contactId: r.contactId, email: r.email })),
        message: sendMessage.trim(),
        prefillAmount: sendAmount ? parseFloat(sendAmount) : null,
        utmParams: {
          utmSource: "outreach",
          utmMedium: "email",
          utmCampaign: campaign.campaignId,
          utmContent: "invite",
        },
      };
      const res = await sendOutreachInvitations(outreachCampaignId, payload);
      const msg = res?.data
        ? `${res.data.successful} sent, ${res.data.failed} failed`
        : "Invitations sent";
      setSuccess(msg);
      setShowSendModal(false);
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to send invitations"
      );
    } finally {
      setSending(false);
    }
  };

  const handleResendFailed = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await resendFailedInvitations(outreachCampaignId);
      const msg = res?.data
        ? `${res.data.successful} resent, ${res.data.failed} still failing`
        : "Resend attempted";
      setSuccess(msg);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
        <div>
          <button onClick={load} className="mt-2 px-3 py-1 border rounded">
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!campaign) return null;

  const totals = campaign.totals || {};
  const totalRecipients = recipients.length;
  const allSent = recipients.every((r) => r.status === "sent");
  const failedCount = recipients.filter((r) => r.status === "failed").length;

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <div className="mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
              {campaign.name}
            </h1>
            <div className="text-[color:var(--color-secondary-text)] mt-1">
              Status: {campaign.status} · Created:{" "}
              {new Date(campaign.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/campaigns/${campaign.campaignId}`}
              className="px-4 py-2 border rounded text-[color:var(--color-text)]"
            >
              Back
            </Link>
            <button
              onClick={handleOpenSend}
              disabled={sending || totalRecipients === 0 || allSent}
              title={
                totalRecipients === 0
                  ? "No recipients added yet"
                  : allSent
                  ? "All recipients already sent"
                  : undefined
              }
              className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send Invitations"}
            </button>
            <button
              onClick={handleResendFailed}
              disabled={resending || failedCount === 0}
              title={
                failedCount === 0 ? "No failed recipients to resend" : undefined
              }
              className="px-4 py-2 border rounded text-[color:var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Resending..." : `Resend Failed (${failedCount})`}
            </button>
          </div>
        </div>

        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">
            Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                color: "#3b82f6",
                Icon: FiMail,
                label: "Recipients",
                value: totalRecipients,
              },
              {
                color: "#6366f1",
                Icon: FaRegCalendarCheck,
                label: "Sent",
                value: totals.sends || 0,
              },
              {
                color: "#f59e0b",
                Icon: FiEye,
                label: "Opened",
                value: totals.uniqueOpens || 0,
              },
              {
                color: "#a855f7",
                Icon: FiMousePointer,
                label: "Clicked",
                value: totals.uniqueClicks || 0,
              },
              {
                color: "#14b8a6",
                Icon: FiDollarSign,
                label: "Donations",
                value: totals.donations || 0,
              },
              {
                color: "#22c55e",
                Icon: FiDollarSign,
                label: "Raised",
                value: number(totals.totalAmount || 0),
              },
            ].map((status, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-lg border border-[color:var(--color-muted)] bg-[color:var(--color-background)]"
              >
                <span
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: status.color + "22" }}
                >
                  <status.Icon
                    className="text-lg"
                    style={{ color: status.color }}
                  />
                </span>
                <div>
                  <div className="font-bold text-[color:var(--color-text)]">
                    {status.value}
                  </div>
                  <div className="text-sm text-[color:var(--color-secondary-text)]">
                    {status.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">
            Recipients
          </h2>
          {recipients.length === 0 ? (
            <div className="flex items-center justify-between bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-4">
              <div className="text-[color:var(--color-secondary-text)]">
                No recipients added yet. Add recipients from the composition
                page to enable sending.
              </div>
              <Link
                to={`/campaigns/${campaign.campaignId}/outreach/compose`}
                className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded hover:bg-[color:var(--color-primary)]/90 transition-colors"
              >
                Add Recipients
              </Link>
            </div>
          ) : (
            <Table
              columns={[
                { key: "email", label: "Email" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : row.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  ),
                },
                {
                  key: "opened",
                  label: "Opened",
                  render: (r) => (r.opened ? "Yes" : "No"),
                },
                {
                  key: "clicked",
                  label: "Clicked",
                  render: (r) => (r.clicked ? "Yes" : "No"),
                },
                {
                  key: "donated",
                  label: "Donated",
                  render: (r) => (r.donated ? "Yes" : "No"),
                },
                {
                  key: "donatedAmount",
                  label: "Amount",
                  render: (r) => number(r.donatedAmount || 0),
                },
              ]}
              data={recipients}
            />
          )}
        </div>

        <EntityFormModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          onSubmit={async (form) => {
            setSendMessage(form.message || "");
            setSendAmount(form.prefillAmount || "");
            await handleConfirmSend();
          }}
          title="Send Invitations"
          submitText={sending ? "Sending..." : "Send"}
          loading={sending}
          fields={[
            {
              name: "message",
              label: "Personalized Message",
              type: "textarea",
              required: true,
              placeholder: "Add a personal touch to your outreach message...",
            },
            {
              name: "prefillAmount",
              label: "Prefill Donation Amount (Optional)",
              type: "number",
              required: false,
              placeholder: "0.00",
            },
          ]}
          initialValues={{ message: sendMessage, prefillAmount: sendAmount }}
          validate={(form) => {
            const err = {};
            if (!String(form.message || "").trim())
              err.message = "Message is required";
            if (form.prefillAmount && Number(form.prefillAmount) < 0)
              err.prefillAmount = "Amount must be >= 0";
            return err;
          }}
        />

        <Notification
          type={error ? "error" : "success"}
          message={error || success}
          isVisible={!!(error || success)}
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          duration={5000}
        />
      </div>
    </div>
  );
};

export default OutreachCampaignDetailPage;
