import React, { useState } from "react";
import { FiX, FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import { generateSocialMediaLinks } from "../services/outreachApi";
import Notification from "../../../components/Notification";
import facebookIcon from "../../../assets/facebook.png";
import whatsappIcon from "../../../assets/whatsapp.png";

const SocialSharingModal = ({ isOpen, onClose, campaignId, campaignTitle }) => {
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("whatsapp");
  const [copiedLink, setCopiedLink] = useState(null);
  const [error, setError] = useState(null);

  const platforms = [
    { value: "whatsapp", label: "WhatsApp", icon: whatsappIcon },
    { value: "facebook", label: "Facebook", icon: facebookIcon },
  ];

  const handleGenerateLinks = async () => {
    if (!campaignId) return;

    setLoading(true);
    setError(null);

    try {
      const options = {
        platform: selectedPlatform,
        customMessage: customMessage.trim(),
        utmSource: "campaign_outreach",
        utmMedium: "social",
      };

      const result = await generateSocialMediaLinks(campaignId, options);
      setSocialLinks(result);
    } catch (err) {
      setError(err.message || "Failed to generate social media links");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (link, platform) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(platform);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = (platform, shareUrl) => {
    if (!shareUrl) return;

    if (platform === "whatsapp") {
      const message = customMessage?.trim()
        ? `${customMessage.trim()}\n${shareUrl}`
        : shareUrl;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
      return;
    }

    // For Facebook - open in popup with the share URL so OG scraper fetches preview
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      fbUrl,
      "share",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const resetModal = () => {
    setSocialLinks(null);
    setCustomMessage("");
    setSelectedPlatform("whatsapp");
    setCopiedLink(null);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[color:var(--color-primary-text)]">
            Share Campaign
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[color:var(--color-muted)] rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <Notification
            type="error"
            message={error}
            isVisible={!!error}
            onClose={() => setError(null)}
            duration={5000}
          />
        )}

        {/* Campaign Info */}
        <div className="mb-6 p-4 bg-[color:var(--color-surface)] rounded-lg">
          <h3 className="font-medium text-[color:var(--color-primary-text)] mb-2">
            Campaign: {campaignTitle}
          </h3>
          <p className="text-sm text-[color:var(--color-secondary-text)]">
            Generate social media sharing links to promote your campaign
          </p>
        </div>

        {!socialLinks ? (
          /* Link Generation Form */
          <div className="space-y-4">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Select Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => setSelectedPlatform(platform.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      selectedPlatform === platform.value
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                        : "border-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]"
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto mb-2">
                      <img
                        src={platform.icon}
                        alt={platform.label}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-sm font-medium">{platform.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to your social media posts..."
                className="w-full p-3 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-[color:var(--color-secondary-text)] mt-1 text-right">
                {customMessage.length}/500
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateLinks}
              disabled={loading}
              className="w-full bg-[color:var(--color-primary)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[color:var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Links...
                </>
              ) : (
                <>
                  <FiShare2 className="w-4 h-4" />
                  Generate Social Media Links
                </>
              )}
            </button>
          </div>
        ) : (
          /* Generated Links Display */
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-green-500 text-6xl mb-2">✅</div>
              <h3 className="text-lg font-medium text-[color:var(--color-primary-text)]">
                Links Generated Successfully!
              </h3>
              <p className="text-sm text-[color:var(--color-secondary-text)]">
                Share these links on your social media platforms
              </p>
            </div>

            {/* Social Media Links */}
            <div className="space-y-3">
              {socialLinks?.socialLinks &&
                Object.entries(socialLinks.socialLinks).map(
                  ([platform, data]) => (
                    <div
                      key={platform}
                      className="p-4 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-surface)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8">
                            <img
                              src={
                                platforms.find((p) => p.value === platform)
                                  ?.icon || whatsappIcon
                              }
                              alt={platform}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-[color:var(--color-primary-text)] capitalize">
                              {platform}
                            </div>
                            <div className="text-sm text-[color:var(--color-secondary-text)]">
                              {data.type === "share"
                                ? "Social Share"
                                : "Direct Link"}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShare(platform, data.url)}
                            className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[color:var(--color-primary)]/90 transition-colors"
                          >
                            Share
                          </button>
                          <button
                            onClick={() =>
                              handleCopyLink(data.trackingUrl, platform)
                            }
                            className="px-4 py-2 border border-[color:var(--color-muted)] rounded-lg text-sm font-medium hover:bg-[color:var(--color-muted)] transition-colors flex items-center gap-2"
                          >
                            {copiedLink === platform ? (
                              <>
                                <FiCheck className="w-4 h-4 text-green-500" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <FiCopy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={resetModal}
                className="flex-1 py-3 px-6 border border-[color:var(--color-muted)] rounded-lg font-medium text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
              >
                Generate New Links
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-6 bg-[color:var(--color-primary)] text-white rounded-lg font-medium hover:bg-[color:var(--color-primary)]/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSharingModal;
