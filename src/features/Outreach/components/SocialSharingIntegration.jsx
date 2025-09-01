import React, { useState } from "react";
import { SecondaryButton } from "../../../components/Buttons";
import Notification from "../../../components/Notification";

const SocialSharingIntegration = ({ campaignId, campaignTitle }) => {
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState(null);

  const handleSocialShare = async (platform) => {
    setSharing(true);
    setShareError(null);

    try {
      // TODO: Implement social media API call
      // const result = await outreachApi.generateSocialMediaLinks(campaignId, { platform });

      // For now, simulate success
      setTimeout(() => {
        setShareSuccess(true);
        setSharing(false);

        // Reset success message after 3 seconds
        setTimeout(() => setShareSuccess(false), 3000);
      }, 1000);
    } catch (err) {
      setShareError(err.message || `Failed to share on ${platform}`);
      setSharing(false);
    }
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: "📱",
      color: "#25D366",
      onClick: () => handleSocialShare("whatsapp"),
    },
    {
      name: "Facebook",
      icon: "📘",
      color: "#1877F2",
      onClick: () => handleSocialShare("facebook"),
    },
    {
      name: "Twitter",
      icon: "🐦",
      color: "#1DA1F2",
      onClick: () => handleSocialShare("twitter"),
    },
    {
      name: "LinkedIn",
      icon: "💼",
      color: "#0A66C2",
      onClick: () => handleSocialShare("linkedin"),
    },
  ];

  return (
    <div className="border-t border-[color:var(--color-muted)] pt-6">
      <div className="mb-5">
        <h4 className="text-xl font-semibold text-[color:var(--color-primary-text)] mb-2 m-0">
          Share Campaign
        </h4>
        <p className="text-[color:var(--color-secondary-text)] m-0">
          Spread the word about your campaign on social media
        </p>
      </div>

      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4">
        {socialPlatforms.map((platform) => (
          <SecondaryButton
            key={platform.name}
            onClick={platform.onClick}
            disabled={sharing}
            className="flex items-center gap-2 min-w-[120px] justify-center"
            style={{
              borderColor: platform.color,
              color: platform.color,
            }}
          >
            <span className="text-xl">{platform.icon}</span>
            <span className="font-medium">{platform.name}</span>
          </SecondaryButton>
        ))}
      </div>

      {sharing && (
        <div className="text-center py-4 text-[color:var(--color-secondary-text)]">
          <p className="m-0">Generating share links...</p>
        </div>
      )}

      {shareSuccess && (
        <Notification
          type="success"
          message="Share links generated successfully!"
          isVisible={shareSuccess}
          onClose={() => setShareSuccess(false)}
          duration={3000}
        />
      )}

      {shareError && (
        <Notification
          type="error"
          message={shareError}
          isVisible={shareError}
          onClose={() => setShareError(null)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default SocialSharingIntegration;
