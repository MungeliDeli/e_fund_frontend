import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Notification from "../../../components/Notification";
import SearchableDropdown from "../../../components/SearchableDropdown";
import {
  getSegments,
  getContactsBySegment,
  createOutreachCampaign,
  listOutreachCampaigns,
  addOutreachRecipients,
} from "../services/outreachApi";
import { getCampaignById } from "../../campaigns/services/campaignApi";

const OutreachCompositionPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Campaign data
  const [campaign, setCampaign] = useState(null);

  // Outreach campaign data
  const [outreachCampaigns, setOutreachCampaigns] = useState([]);
  const [selectedOutreachCampaign, setSelectedOutreachCampaign] =
    useState(null);
  const [outreachCampaignName, setOutreachCampaignName] = useState("");
  const [outreachCampaignDescription, setOutreachCampaignDescription] =
    useState("");
  const [isCreatingNewCampaign, setIsCreatingNewCampaign] = useState(true);

  // Recipient selection
  const [sendingOption, setSendingOption] = useState(""); // "segments", "all"
  const [availableEmails, setAvailableEmails] = useState([]);

  // Segment selection
  const [segments, setSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);

  // Form data (campaign only)

  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [messageError, setMessageError] = useState(null);

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
      loadSegments();
      loadOutreachCampaigns();
    }
  }, [campaignId]);

  // Load contacts after segments are loaded
  useEffect(() => {
    if (segments.length > 0) {
      loadAllContacts();
    }
  }, [segments]);

  const loadCampaign = async () => {
    try {
      const campaignData = await getCampaignById(campaignId);

      setCampaign(campaignData.data);
    } catch (err) {
      setError(err.message || "Failed to load campaign details");
    }
  };

  const loadSegments = async () => {
    try {
      const segmentsData = await getSegments();

      // Ensure segmentsData is an array and handle different response formats
      if (Array.isArray(segmentsData)) {
        setSegments(segmentsData);
      } else if (segmentsData && Array.isArray(segmentsData.data)) {
        setSegments(segmentsData.data);
      } else if (
        segmentsData &&
        segmentsData.segments &&
        Array.isArray(segmentsData.segments)
      ) {
        setSegments(segmentsData.segments);
      } else {
        setSegments([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load segments");
      setSegments([]);
    }
  };

  const loadOutreachCampaigns = async () => {
    try {
      const campaignsData = await listOutreachCampaigns(campaignId);

      // Handle different response formats
      const campaigns = Array.isArray(campaignsData)
        ? campaignsData
        : campaignsData?.data || [];

      setOutreachCampaigns(campaigns);
    } catch (err) {
      console.error("Failed to load outreach campaigns:", err);
      setOutreachCampaigns([]);
    }
  };

  const loadAllContacts = async () => {
    try {
      // Load contacts from all segments to create email list
      const allContacts = [];

      if (segments.length === 0) {
        setAvailableEmails([]);
        setLoading(false);
        return;
      }

      for (const segment of segments) {
        try {
          const contacts = await getContactsBySegment(segment.segmentId);

          if (Array.isArray(contacts)) {
            allContacts.push(...contacts);
          } else if (contacts && Array.isArray(contacts.data)) {
            allContacts.push(...contacts.data);
          } else {
          }
        } catch (err) {}
      }

      // Remove duplicates and format for SearchableDropdown
      const uniqueContacts = allContacts.filter(
        (contact, index, self) =>
          index === self.findIndex((c) => c.email === contact.email)
      );

      setAvailableEmails(
        uniqueContacts.map((contact) => ({
          categoryId: contact.email, // Using email as ID for SearchableDropdown
          name: `${contact.name || "Unknown"} (${contact.email})`,
          contact: contact,
        }))
      );
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendingOptionChange = (option) => {
    setSendingOption(option);
    if (option === "all") setSelectedSegments([]);
  };

  const handleSegmentSelection = (segmentId) => {
    if (segmentId) {
      const segment = segments.find((s) => s.segmentId === segmentId);
      if (segment && !selectedSegments.find((s) => s.segmentId === segmentId)) {
        setSelectedSegments([...selectedSegments, segment]);
      }
    }
  };

  const handleSegmentRemoval = (segmentToRemove) => {
    setSelectedSegments(
      selectedSegments.filter(
        (segment) => segment.segmentId !== segmentToRemove.segmentId
      )
    );
  };

  const getTotalRecipientCount = () => {
    if (sendingOption === "segments") {
      return selectedSegments.reduce(
        (total, segment) => total + (segment.contactCount || 0),
        0
      );
    } else if (sendingOption === "all") {
      return availableEmails.length;
    }
    return 0;
  };

  const handleCreateCampaign = async () => {
    if (!sendingOption) {
      setError("Please select recipients: segments or all contacts");
      return;
    }

    if (sendingOption === "segments" && selectedSegments.length === 0) {
      setError("Please select at least one segment");
      return;
    }

    // Validate outreach campaign
    if (
      isCreatingNewCampaign &&
      (!outreachCampaignName || outreachCampaignName.trim().length === 0)
    ) {
      setError("Please enter an outreach campaign name");
      return;
    }

    if (!isCreatingNewCampaign && !selectedOutreachCampaign) {
      setError("Please select an outreach campaign");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      let outreachCampaignId;

      // Create or select outreach campaign
      if (isCreatingNewCampaign) {
        const newCampaign = await createOutreachCampaign(campaignId, {
          name: outreachCampaignName.trim(),
          description: outreachCampaignDescription.trim() || null,
        });
        outreachCampaignId = newCampaign.data.outreachCampaignId;
      } else {
        outreachCampaignId = selectedOutreachCampaign.outreachCampaignId;
      }
      // Add recipients based on selection
      if (sendingOption === "segments") {
        await addOutreachRecipients(outreachCampaignId, {
          segmentIds: selectedSegments.map((s) => s.segmentId),
        });
      } else if (sendingOption === "all") {
        await addOutreachRecipients(outreachCampaignId, { all: true });
      }

      setSuccess(
        `Outreach campaign created and recipients added successfully.`
      );
      setTimeout(() => {
        navigate(`/organizer/outreach-campaigns/${outreachCampaignId}`);
      }, 1200);
    } catch (err) {
      console.error("Outreach invitation sending error:", err);

      // Handle specific error cases
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to create outreach campaign or add recipients.");
      }
    } finally {
      setSubmitting(false);
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
      <div className=" mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
                Send Campaign Invitations
              </h1>
              <p className="text-[color:var(--color-secondary-text)] mt-2">
                Create an outreach campaign and send personalized invitations to
                your contacts
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
          <div className="text-[color:var(--color-secondary-text)]">
            {campaign ? (
              <>
                <div className="text-lg font-medium text-[color:var(--color-text)] mb-1">
                  {campaign.name}
                </div>
              </>
            ) : (
              <div>Loading campaign details...</div>
            )}
          </div>
        </div>

        {/* Recipient Options */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-6">
            Select Recipients
          </h2>

          <div className="space-y-4">
            {/* Single Email Selection removed in MVP */}

            {/* Segment Selection */}
            <div className="border border-[color:var(--color-muted)] rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="segments"
                  name="sendingOption"
                  value="segments"
                  checked={sendingOption === "segments"}
                  onChange={() => handleSendingOptionChange("segments")}
                  className="
                      mr-3 w-4 h-4 rounded-full border border-gray-300 
                      appearance-none cursor-pointer
                      checked:border-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)]
                      relative
                    "
                />

                <label
                  htmlFor="segments"
                  className="text-[color:var(--color-text)] font-medium"
                >
                  Send to Selected Segments
                </label>
              </div>

              {sendingOption === "segments" && (
                <div className="ml-6 space-y-3">
                  {loading ? (
                    <div className="text-[color:var(--color-secondary-text)]">
                      Loading segments...
                    </div>
                  ) : !Array.isArray(segments) || segments.length === 0 ? (
                    <div className="text-[color:var(--color-secondary-text)]">
                      {error ? (
                        <div className="space-y-2">
                          <div>Failed to load segments. Please try again.</div>
                          <button
                            onClick={loadSegments}
                            className="px-3 py-1 text-sm bg-[color:var(--color-accent)] text-white rounded hover:bg-[color:var(--color-accent)]/90 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <>
                          No segments available. Please{" "}
                          <button
                            onClick={() => navigate("/organizer/contacts")}
                            className="text-[color:var(--color-accent)] hover:underline"
                          >
                            create segments in the Contacts section
                          </button>{" "}
                          first.
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <SearchableDropdown
                        options={segments.map((segment) => ({
                          categoryId: segment.segmentId,
                          name: `${segment.name} (${
                            segment.contactCount || 0
                          } contacts)`,
                        }))}
                        value=""
                        onChange={handleSegmentSelection}
                        placeholder="Search and select segments..."
                        className="w-full"
                      />

                      {selectedSegments.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-[color:var(--color-secondary-text)]">
                            Selected segments ({selectedSegments.length}):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSegments.map((segment) => (
                              <div
                                key={segment.segmentId}
                                className="flex items-center gap-2 px-3 py-1 bg-[color:var(--color-accent)] text-white rounded-full text-sm"
                              >
                                <span>
                                  {segment.name} ({segment.contactCount || 0}{" "}
                                  contacts)
                                </span>
                                <button
                                  onClick={() => handleSegmentRemoval(segment)}
                                  className="text-white hover:text-red-200 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* All Contacts Option */}
            <div className="border border-[color:var(--color-muted)] rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="all"
                  name="sendingOption"
                  value="all"
                  checked={sendingOption === "all"}
                  onChange={() => handleSendingOptionChange("all")}
                  className="mr-3 w-4 h-4 rounded-full border border-gray-300 
                      appearance-none cursor-pointer
                      checked:border-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)]
                      relative
                    "
                />
                <label
                  htmlFor="all"
                  className="text-[color:var(--color-text)] font-medium"
                >
                  Send to All Contacts ({availableEmails.length} total)
                </label>
              </div>

              {sendingOption === "all" && (
                <div className="ml-6">
                  <div className="text-sm text-[color:var(--color-secondary-text)]">
                    This will send the outreach email to all contacts across all
                    your segments.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Outreach Campaign Selection */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)] mb-6">
            Outreach Campaign
          </h2>

          <div className="space-y-6">
            {/* Campaign Selection Mode */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-text)] mb-3">
                Campaign Selection
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="createNew"
                    name="campaignMode"
                    checked={isCreatingNewCampaign}
                    onChange={() => setIsCreatingNewCampaign(true)}
                    className="mr-3 w-4 h-4 rounded-full border border-gray-300 
                        appearance-none cursor-pointer
                        checked:border-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)]
                        relative
                      "
                  />
                  <label
                    htmlFor="createNew"
                    className="text-[color:var(--color-text)] font-medium"
                  >
                    Create New Outreach Campaign
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="selectExisting"
                    name="campaignMode"
                    checked={!isCreatingNewCampaign}
                    onChange={() => setIsCreatingNewCampaign(false)}
                    className="mr-3 w-4 h-4 rounded-full border border-gray-300 
                        appearance-none cursor-pointer
                        checked:border-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)]
                        relative
                      "
                  />
                  <label
                    htmlFor="selectExisting"
                    className="text-[color:var(--color-text)] font-medium"
                  >
                    Use Existing Outreach Campaign
                  </label>
                </div>
              </div>
            </div>

            {/* Create New Campaign Form */}
            {isCreatingNewCampaign && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={outreachCampaignName}
                    onChange={(e) => setOutreachCampaignName(e.target.value)}
                    placeholder="e.g., Family & Friends Invitation"
                    className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={outreachCampaignDescription}
                    onChange={(e) =>
                      setOutreachCampaignDescription(e.target.value)
                    }
                    placeholder="Brief description of this outreach campaign..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Select Existing Campaign */}
            {!isCreatingNewCampaign && (
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                  Select Outreach Campaign *
                </label>
                {outreachCampaigns.length === 0 ? (
                  <div className="text-[color:var(--color-secondary-text)] p-4 border border-[color:var(--color-muted)] rounded-lg">
                    No existing outreach campaigns found. Create a new one
                    instead.
                  </div>
                ) : (
                  <SearchableDropdown
                    options={outreachCampaigns.map((campaign) => ({
                      categoryId: campaign.outreachCampaignId,
                      name: `${campaign.name} (${campaign.status})`,
                    }))}
                    value={selectedOutreachCampaign?.outreachCampaignId || ""}
                    onChange={(campaignId) => {
                      const campaign = outreachCampaigns.find(
                        (c) => c.outreachCampaignId === campaignId
                      );
                      setSelectedOutreachCampaign(campaign);
                    }}
                    placeholder="Search and select an outreach campaign..."
                    className="w-full"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Invitation configuration removed here; handled on detail page when sending */}

        {/* Preview removed in creation step */}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="px-6 py-3 text-[color:var(--color-text)] border border-[color:var(--color-muted)] rounded-lg hover:bg-[color:var(--color-surface)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCampaign}
            disabled={
              !sendingOption ||
              submitting ||
              (sendingOption === "segments" && selectedSegments.length === 0) ||
              (isCreatingNewCampaign && !outreachCampaignName.trim()) ||
              (!isCreatingNewCampaign && !selectedOutreachCampaign)
            }
            className="px-6 py-3 bg-[color:var(--color-primary)] text-white rounded-lg hover:bg-[color:var(--color-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Outreach Campaign"}
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
