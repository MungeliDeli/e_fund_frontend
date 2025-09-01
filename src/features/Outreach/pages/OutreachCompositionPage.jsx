import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Notification from "../../../components/Notification";
import { getSegments, sendOutreachEmail } from "../services/outreachApi";

const OutreachCompositionPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [segments, setSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState("");
  const [emailType, setEmailType] = useState("invite");
  const [personalizedMessage, setPersonalizedMessage] = useState("");
  const [prefillAmount, setPrefillAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (campaignId) {
      loadSegments();
    }
  }, [campaignId]);

  const loadSegments = async () => {
    setLoading(true);
    setError(null);

    try {
      const segmentsData = await getSegments();
      setSegments(segmentsData);
    } catch (err) {
      setError(err.message || "Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOutreach = async () => {
    if (!selectedSegment) {
      setError("Please select a segment to send outreach to");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await sendOutreachEmail({
        campaignId,
        segmentId: selectedSegment,
        type: emailType,
        personalizedMessage,
        prefillAmount: prefillAmount ? parseFloat(prefillAmount) : undefined,
        utmParams: {
          utmSource: "outreach",
          utmMedium: "email",
          utmCampaign: campaignId,
          utmContent: emailType,
        },
      });

      setSuccess("Outreach email sent successfully!");

      // Redirect back to campaign view after a short delay
      setTimeout(() => {
        navigate(`/campaigns/${campaignId}`);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to send outreach email");
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    navigate(`/campaigns/${campaignId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
                Campaign Outreach
              </h1>
              <p className="text-[color:var(--color-secondary-text)] mt-2">
                Send personalized outreach emails to your contacts
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[color:var(--color-text)] border border-[color:var(--color-muted)] rounded-lg hover:bg-[color:var(--color-surface)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Campaign Context */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">
            Campaign Context
          </h2>
          <div className="text-[color:var(--color-secondary-text)]">
            Campaign ID: {campaignId}
          </div>
        </div>

        {/* Outreach Form */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-6">
            Outreach Configuration
          </h2>

          <div className="space-y-6">
            {/* Segment Selection */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                Select Segment *
              </label>
              {loading ? (
                <div className="text-[color:var(--color-secondary-text)]">
                  Loading segments...
                </div>
              ) : (
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]"
                >
                  <option value="">Choose a segment</option>
                  {segments.map((segment) => (
                    <option key={segment.segmentId} value={segment.segmentId}>
                      {segment.name} ({segment.contactCount || 0} contacts)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Email Type */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                Email Type *
              </label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]"
              >
                <option value="invite">Campaign Invitation</option>
                <option value="update">Campaign Update</option>
                <option value="thanks">Thank You Message</option>
              </select>
            </div>

            {/* Personalized Message */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                Personalized Message
              </label>
              <textarea
                value={personalizedMessage}
                onChange={(e) => setPersonalizedMessage(e.target.value)}
                placeholder="Add a personal touch to your outreach message..."
                rows={4}
                className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)] resize-none"
              />
              <div className="text-xs text-[color:var(--color-secondary-text)] mt-1">
                {personalizedMessage.length}/1000 characters
              </div>
            </div>

            {/* Prefill Amount */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                Prefill Donation Amount (Optional)
              </label>
              <input
                type="number"
                value={prefillAmount}
                onChange={(e) => setPrefillAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]"
              />
              <div className="text-xs text-[color:var(--color-secondary-text)] mt-1">
                This amount will be pre-filled when contacts click the donation
                link
              </div>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-4">
            Email Preview
          </h2>
          <div className="border border-[color:var(--color-muted)] rounded-lg p-4 bg-[color:var(--color-background)]">
            <div className="text-sm text-[color:var(--color-secondary-text)] mb-2">
              Subject:{" "}
              {emailType === "invite"
                ? "Join Our Campaign"
                : emailType === "update"
                ? "Campaign Update"
                : "Thank You"}
            </div>
            <div className="text-[color:var(--color-text)]">
              {personalizedMessage ||
                "Your personalized message will appear here..."}
            </div>
            <div className="text-xs text-[color:var(--color-secondary-text)] mt-4">
              This email will be sent to{" "}
              {segments.find((s) => s.segmentId === selectedSegment)
                ?.contactCount || 0}{" "}
              contacts
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            disabled={sending}
            className="px-6 py-3 text-[color:var(--color-text)] border border-[color:var(--color-muted)] rounded-lg hover:bg-[color:var(--color-surface)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendOutreach}
            disabled={!selectedSegment || sending}
            className="px-6 py-3 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Outreach"}
          </button>
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

export default OutreachCompositionPage;
