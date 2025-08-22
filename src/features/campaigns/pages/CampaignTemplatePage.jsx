import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiShare2,
  FiHeart,
} from "react-icons/fi";
import Header from "../../../layout/Header/Header";
import MediaGallery from "../components/MediaGallery";
import DonationSection from "../components/DonationSection";
import RecentDonations from "../components/RecentDonations";
import SuccessStories from "../components/SuccessStories";
import WordsOfSupport from "../components/WordsOfSupport";
import QuickDonation from "../components/QuickDonation";
import {
  getCampaignById,
  getCampaignByShareLink,
} from "../services/campaignApi";
import Notification from "../../../components/Notification";
import FundraiseLogo from "./../../../assets/fundraise logo.svg";
import PaymentModal from "../components/PaymentModal";

function Logo() {
  return (
    <span className="flex items-center">
      <img src={FundraiseLogo} alt="FundFlow Logo" className="w-10 h-10" />
      <span className="ml-2 font-bold text-2xl text-[color:var(--color-primary)] hidden sm:inline">
        FundFlow
      </span>
    </span>
  );
}

function CampaignTemplatePage({
  campaignId: propCampaignId,
  isPreview = false,
}) {
  const { campaignId: paramCampaignId, shareSlug } = useParams();
  const campaignId = propCampaignId || paramCampaignId || null;
  const shareParam = shareSlug || null;
  const navigate = useNavigate();
  const donationSectionRef = useRef(null);

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState("50");

  // Theme color from campaign settings
  const themeColor = campaign?.customPageSettings?.themeColor || "#10B981";

  useEffect(() => {
    fetchCampaign();
  }, [campaignId, shareParam]);

  // Set CSS custom property for theme color
  useEffect(() => {
    if (themeColor) {
      document.documentElement.style.setProperty(
        "--campaign-theme-color",
        themeColor
      );
    }
    return () => {
      document.documentElement.style.removeProperty("--campaign-theme-color");
    };
  }, [themeColor]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      let response;
      if (isPreview || campaignId) {
        response = await getCampaignById(campaignId);
      } else if (shareParam) {
        // shareSlug may include "FR-CO-XXXX-title-slug"; backend expects just the shareLink portion
        const shareLinkOnly = shareParam.split("-").slice(0, 3).join("-");
        response = await getCampaignByShareLink(shareLinkOnly);
      } else {
        throw new Error("No campaign identifier provided");
      }

      const data = response?.data?.data || response?.data || response;
      setCampaign(data);
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
      setError("Failed to load campaign");
      setNotification({
        isVisible: true,
        type: "error",
        message: "Failed to load campaign",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToDonation = () => {
    if (donationSectionRef.current) {
      donationSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Highlight the donation section briefly
      donationSectionRef.current.classList.add("highlight-donation");
      setTimeout(() => {
        donationSectionRef.current?.classList.remove("highlight-donation");
      }, 2000);
    }
  };

  const handleDonateClick = (amount = "50") => {
    setSelectedDonationAmount(amount);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (paymentData) => {
    // TODO: Implement donation processing
    console.log("Payment data:", paymentData);
    setNotification({
      isVisible: true,
      type: "success",
      message: `Donation of ${formatAmount(paymentData.amount)} initiated!`,
    });
    setShowPaymentModal(false);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: campaign.customPageSettings?.title || campaign.title,
          text: campaign.customPageSettings?.message || campaign.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setNotification({
          isVisible: true,
          type: "success",
          message: "Campaign link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Failed to share:", error);
      setNotification({
        isVisible: true,
        type: "error",
        message: "Failed to share campaign",
      });
    }
  };

  const calculateDaysRemaining = () => {
    if (!campaign?.endDate) return null;
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateProgress = () => {
    console.log(campaign);
    if (!campaign?.goalAmount) return 0;
    const currentAmount = campaign?.currentRaisedAmount || 0;
    return Math.min((currentAmount / campaign.goalAmount) * 100, 100);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const truncateMessage = (message, maxLength = 200) => {
    if (!message || message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-[color:var(--color-secondary-text)]">
              Loading campaign...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Campaign not found"}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-accent)]"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining();
  const progress = calculateProgress();
  const mainMedia = campaign.customPageSettings?.mainMedia?.url;
  const secondaryImages =
    campaign.customPageSettings?.secondaryImages?.map((img) => img.url) || [];
  const predefinedAmounts = campaign.customPageSettings?.predefinedAmounts || [
    "25",
    "50",
    "100",
    "200",
  ];

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() =>
          setNotification((prev) => ({ ...prev, isVisible: false }))
        }
        duration={4000}
      />

      {/* Main Content */}
      <div className="px-1 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4">
        {/* Organizer Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[color:var(--color-muted)] rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-[color:var(--color-primary-text)]">
                {campaign.organizerName?.[0]?.toUpperCase() || "O"}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-xl text-[color:var(--color-primary-text)]">
                {campaign.organizerName || "Organization"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <Logo />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-2">
          {/* Left Section - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            {/* Media Gallery */}
            <MediaGallery
              mainMedia={mainMedia}
              secondaryImages={secondaryImages}
              title={campaign.customPageSettings?.title || campaign.name}
            />

            {/* Campaign Message */}
            <div className="bg-[color:var(--color-background)] rounded-lg p-4">
              <div className="prose max-w-none">
                <p className="text-[color:var(--color-primary-text)] leading-relaxed">
                  {showFullMessage
                    ? campaign.customPageSettings?.message ||
                      campaign.description
                    : truncateMessage(
                        campaign.customPageSettings?.message ||
                          campaign.description
                      )}
                </p>
                {(campaign.customPageSettings?.message || campaign.description)
                  ?.length > 200 && (
                  <button
                    onClick={() => setShowFullMessage(!showFullMessage)}
                    className="mt-3 text-sm font-medium"
                    style={{ color: themeColor }}
                  >
                    {showFullMessage ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>

            {/* Donate and Share Buttons */}
            <div className="flex gap-3 px-4">
              <button
                onClick={() => handleDonateClick("50")}
                className="flex-1 py-3 px-6 rounded-lg border-2 font-semibold transition-colors"
                style={{
                  borderColor: `${themeColor}40`,
                  color: themeColor,
                  backgroundColor: "transparent",
                }}
              >
                Donate
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-3 px-6 rounded-lg border-2 font-semibold transition-colors flex items-center justify-center gap-2"
                style={{
                  borderColor: `${themeColor}40`,
                  color: themeColor,
                  backgroundColor: "transparent",
                }}
              >
                <FiShare2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Campaign Stats */}
            <div className="flex items-center justify-between py-3 border-t border-[color:var(--color-muted)] px-4">
              <div className="flex items-center gap-2 text-[color:var(--color-secondary-text)]">
                <FiCalendar className="w-4 h-4" />
                <span className="text-sm">
                  Launched: {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>
              {daysRemaining !== null && (
                <div className="flex items-center gap-2 text-[color:var(--color-secondary-text)]">
                  <FiClock className="w-4 h-4" />
                  <span className="text-sm">
                    {daysRemaining} days remaining
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[color:var(--color-secondary-text)]">
                <FiUsers className="w-4 h-4" />
                <span className="text-sm">
                  {campaign.donationCount || 0} supporters
                </span>
              </div>
            </div>

            {/* Words of Support */}
            <WordsOfSupport themeColor={themeColor} />
          </div>

          {/* Right Section - 1 column */}
          <div className="space-y-2 pt-13">
            {/* Donation Section */}
            <div ref={donationSectionRef}>
              <DonationSection
                raisedAmount={campaign.currentRaisedAmount || 0}
                goalAmount={campaign.goalAmount}
                progress={progress}
                donationCount={campaign.donationCount || 0}
                predefinedAmounts={predefinedAmounts}
                themeColor={themeColor}
                formatAmount={formatAmount}
              />
            </div>

            {/* Recent Donations */}
            <RecentDonations themeColor={themeColor} />

            {/* Success Stories */}
            <SuccessStories themeColor={themeColor} />

            {/* Quick Donation */}
            <QuickDonation
              themeColor={themeColor}
              onDonateClick={() => handleDonateClick("50")}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Media Gallery */}
          <MediaGallery
            mainMedia={mainMedia}
            secondaryImages={secondaryImages}
            title={campaign.customPageSettings?.title || campaign.name}
          />

          {/* Donation Section */}
          <div ref={donationSectionRef}>
            <DonationSection
              raisedAmount={campaign.currentRaisedAmount || 0}
              goalAmount={campaign.goalAmount}
              progress={progress}
              donationCount={campaign.donationCount || 0}
              predefinedAmounts={predefinedAmounts}
              themeColor={themeColor}
              formatAmount={formatAmount}
            />
          </div>

          {/* Campaign Message */}
          <div className="bg-[color:var(--color-background)] rounded-lg p-4">
            <div className="prose max-w-none">
              <p className="text-[color:var(--color-primary-text)] leading-relaxed">
                {showFullMessage
                  ? campaign.customPageSettings?.message || campaign.description
                  : truncateMessage(
                      campaign.customPageSettings?.message ||
                        campaign.description
                    )}
              </p>
              {(campaign.customPageSettings?.message || campaign.description)
                ?.length > 200 && (
                <button
                  onClick={() => setShowFullMessage(!showFullMessage)}
                  className="mt-3 text-sm font-medium"
                  style={{ color: themeColor }}
                >
                  {showFullMessage ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          </div>

          {/* Donate and Share Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleDonateClick("50")}
              className="w-full py-3 px-6 rounded-lg border-2 font-semibold transition-colors"
              style={{
                borderColor: themeColor,
                color: themeColor,
                backgroundColor: "transparent",
              }}
            >
              Donate
            </button>
            <button
              onClick={handleShare}
              className="w-full py-3 px-6 rounded-lg border-2 font-semibold transition-colors flex items-center justify-center gap-2"
              style={{
                borderColor: themeColor,
                color: themeColor,
                backgroundColor: "transparent",
              }}
            >
              <FiShare2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-3 gap-3 py-3 border-t border-[color:var(--color-muted)]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[color:var(--color-secondary-text)] mb-1">
                <FiCalendar className="w-3 h-3" />
              </div>
              <span className="text-xs text-[color:var(--color-secondary-text)]">
                Launched: {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>
            {daysRemaining !== null && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[color:var(--color-secondary-text)] mb-1">
                  <FiClock className="w-3 h-3" />
                </div>
                <span className="text-xs text-[color:var(--color-secondary-text)]">
                  {daysRemaining} days remaining
                </span>
              </div>
            )}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[color:var(--color-secondary-text)] mb-1">
                <FiUsers className="w-3 h-3" />
              </div>
              <span className="text-xs text-[color:var(--color-secondary-text)]">
                {campaign.donationCount || 0} supporters
              </span>
            </div>
          </div>

          {/* Recent Donations */}
          <RecentDonations themeColor={themeColor} />

          {/* Words of Support */}
          <WordsOfSupport themeColor={themeColor} />

          {/* Success Stories */}
          <SuccessStories themeColor={themeColor} />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedDonationAmount}
        themeColor={themeColor}
        formatAmount={formatAmount}
        onDonate={handlePaymentSubmit}
      />
    </div>
  );
}

export default CampaignTemplatePage;
