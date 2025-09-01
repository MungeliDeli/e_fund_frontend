import React, { useState } from "react";
import Buttons from "../../../components/Buttons";
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
    <div className="social-sharing-integration">
      <div className="social-sharing-header">
        <h4>Share Campaign</h4>
        <p>Spread the word about your campaign on social media</p>
      </div>

      <div className="social-platforms">
        {socialPlatforms.map((platform) => (
          <Buttons
            key={platform.name}
            onClick={platform.onClick}
            disabled={sharing}
            variant="secondary"
            size="medium"
            className="social-platform-btn"
            style={{
              borderColor: platform.color,
              color: platform.color,
            }}
          >
            <span className="platform-icon">{platform.icon}</span>
            <span className="platform-name">{platform.name}</span>
          </Buttons>
        ))}
      </div>

      {sharing && (
        <div className="sharing-status">
          <p>Generating share links...</p>
        </div>
      )}

      {shareSuccess && (
        <Notification
          type="success"
          message="Share links generated successfully!"
          duration={3000}
        />
      )}

      {shareError && (
        <Notification type="error" message={shareError} duration={5000} />
      )}
    </div>
  );
};

export default SocialSharingIntegration;
