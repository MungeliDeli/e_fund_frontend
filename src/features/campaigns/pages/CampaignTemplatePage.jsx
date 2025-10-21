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
import { createDonation } from "../services/donationApi";
import Notification from "../../../components/Notification";
import FundraiseLogo from "../../../assets/fundraise logo.svg";
import PaymentModal from "../components/PaymentModal";
import PaymentResultModal from "../components/PaymentResultModal";
import ThankYouModal from "../components/ThankYouModal";
import { useAuth } from "../../../contexts/AuthContext";
import GuestAuthPrompt from "../../../components/GuestAuthPrompt";
import { fetchOrganizerById } from "../../users/services/usersApi";
import {
  getDonationStats,
  getDonationStatus,
} from "../../donations/services/donationsApi";
import ErrorState from "../../../components/ErrorState";

function Logo() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="flex items-center cursor-pointer"
      aria-label="Go to home"
    >
      <img src={FundraiseLogo} alt="FundFlow Logo" className="w-10 h-10" />
      <span className="ml-2 font-bold text-2xl text-[color:var(--color-primary)] hidden sm:inline">
        FundIzo
      </span>
    </button>
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
  const { isAuthenticated } = useAuth();
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
  const [showPaymentResultModal, setShowPaymentResultModal] = useState(false);
  const [paymentResultError, setPaymentResultError] = useState(null);
  const [providerLabel, setProviderLabel] = useState("your selected provider");
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState("50");
  const [donationDetails, setDonationDetails] = useState(null);
  const [isProcessingDonation, setIsProcessingDonation] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState("idle"); // idle | submitting | processing | polling | success | failed | timeout
  const pollingRef = useRef(null);
  const [activeDonation, setActiveDonation] = useState({
    donationId: null,
    transactionId: null,
    gatewayRequestId: null,
  });
  const [organizerProfile, setOrganizerProfile] = useState(null);
  const [organizerAvatarUrl, setOrganizerAvatarUrl] = useState("");
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    completedDonations: 0,
    totalAmount: 0,
    anonymousDonations: 0,
  });

  // Theme color from campaign settings
  const themeColor = campaign?.customPageSettings?.themeColor || "#10B981";

  useEffect(() => {
    fetchCampaign();
    // Capture outreach attribution from URL and persist for this session
    try {
      const params = new URLSearchParams(window.location.search);
      const linkTokenId = params.get("lt");
      const contactId = params.get("cid");
      if (linkTokenId) sessionStorage.setItem("outreach_lt", linkTokenId);
      if (contactId) sessionStorage.setItem("outreach_cid", contactId);
    } catch (_) {
      // no-op
    }
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

  // Fetch organizer profile and image when campaign loads
  useEffect(() => {
    const loadOrganizer = async () => {
      try {
        if (!campaign?.organizerId) return;

        const profRes = await fetchOrganizerById(campaign.organizerId);

        const profile = profRes?.data || profRes || null;
        setOrganizerProfile(profile);

        // Use the profilePictureUrl directly from the backend response
        const avatarUrl =
          profile?.profilePictureUrl || profile?.coverPictureUrl || "";
        setOrganizerAvatarUrl(avatarUrl);
      } catch (_) {
        setOrganizerAvatarUrl("");
      }
    };
    loadOrganizer();
  }, [campaign?.organizerId]);

  // Fetch donation statistics when campaign loads
  useEffect(() => {
    const loadDonationStats = async () => {
      try {
        if (!campaign?.campaignId) return;
        const stats = await getDonationStats(campaign.campaignId);
        setDonationStats(stats);
      } catch (error) {
        console.error("Failed to fetch donation stats:", error);
        // Keep default values on error
      }
    };
    loadDonationStats();
  }, [campaign?.campaignId]);

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

  const handlePaymentSubmit = async (paymentData) => {
    try {
      setIsProcessingDonation(true);
      setPaymentPhase("submitting");

      // Open result modal immediately and close the payment modal
      const provider =
        paymentData?.paymentMethod === "airtel"
          ? "Airtel Zambia"
          : paymentData?.paymentMethod === "mtn"
          ? "MTN Zambia"
          : "your selected provider";
      setProviderLabel(provider);
      setPaymentResultError(null);
      setShowPaymentResultModal(true);
      setShowPaymentModal(false);

      // Add campaign ID to payment data
      const donationData = {
        ...paymentData,
        campaignId: campaign.campaignId,
        // Optional outreach attribution
        linkTokenId: sessionStorage.getItem("outreach_lt") || undefined,
        contactId: sessionStorage.getItem("outreach_cid") || undefined,
      };

      // Call the actual donation API
      const response = await createDonation(donationData);

      const resData = response?.data || response;
      const donationId =
        resData?.donation?.donationId || resData?.donationId || null;
      const transactionId =
        resData?.transaction?.transactionId || resData?.transactionId || null;
      const gatewayRequestId =
        resData?.transaction?.gatewayRequestId ||
        resData?.gatewayRequestId ||
        null;

      setActiveDonation({ donationId, transactionId, gatewayRequestId });

      // Prepare ThankYou data but do not show yet
      setDonationDetails({
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        message: paymentData.messageText,
        donationId,
      });

      // Move to processing and start polling for terminal state
      setPaymentPhase("processing");
      setNotification({
        isVisible: true,
        type: "success",
        message:
          "Payment request sent to your phone. Please approve on your device.",
      });

      // Keep showing the result modal while we poll

      // Begin polling donation status
      setPaymentPhase("polling");
      const startedAt = Date.now();
      const timeoutMs = 2 * 60 * 1000; // 2 minutes
      pollingRef.current && clearInterval(pollingRef.current);
      if (donationId) {
        pollingRef.current = setInterval(async () => {
          try {
            const { status } = await getDonationStatus(donationId);
            if (status === "completed") {
              clearInterval(pollingRef.current);
              setPaymentPhase("success");
              setShowPaymentModal(false);
              setShowPaymentResultModal(false);
              setShowThankYouModal(true);
              await fetchCampaign();
              try {
                const stats = await getDonationStats(campaign.campaignId);
                setDonationStats(stats);
              } catch (_) {}
            } else if (status === "failed") {
              clearInterval(pollingRef.current);
              setPaymentPhase("failed");
              setPaymentResultError("Payment was declined. You can try again.");
              setNotification({
                isVisible: true,
                type: "error",
                message: "Payment was declined. You can try again.",
              });
            }
          } catch (_) {
            // ignore transient polling errors
          }
          if (Date.now() - startedAt > timeoutMs) {
            clearInterval(pollingRef.current);
            setPaymentPhase("timeout");
            setPaymentResultError(
              "Payment is taking longer than expected. If you approved, it will reflect shortly; otherwise, please retry."
            );
            setNotification({
              isVisible: true,
              type: "error",
              message:
                "Payment is taking longer than expected. If you approved, it will reflect shortly; otherwise, please retry.",
            });
          }
        }, 2500);
      }
    } catch (error) {
      console.error("Donation failed:", error);
      setPaymentResultError(
        mapProviderError(error?.message) ||
          error?.message ||
          "Failed to process donation. Please try again."
      );
      setShowPaymentResultModal(true);
      setNotification({
        isVisible: true,
        type: "error",
        message:
          mapProviderError(error?.message) ||
          error?.message ||
          "Failed to process donation. Please try again.",
      });
      // Keep the error visible in the result modal; also rethrow for any upstream handling
      throw error;
    } finally {
      setIsProcessingDonation(false);
    }
  };

  const mapProviderError = (message = "") => {
    if (message.includes("9905")) {
      return "That phone number isn't eligible for Mobile Money payments.";
    }
    if (message.includes("9906")) {
      return "Please retry; your previous attempt is still in progress.";
    }
    if (message.includes("995")) {
      return "Payment was declined. You can try again.";
    }
    if (message.includes("2000") || message.includes("No active simulator")) {
      return "Phone number not registered for Mobile Money. Please check your number or try a different payment method.";
    }
    return null;
  };

  const handleThankYouClose = () => {
    setShowThankYouModal(false);
    setDonationDetails(null);
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
      <div className="min-h-screen bg-[color:var(--color-background)] flex items-center justify-center p-4">
        <ErrorState
          title="Failed to load campaign"
          description={error || "We couldn’t load this campaign right now."}
          onRetry={fetchCampaign}
          secondaryAction={{ to: "/", label: "Go to Home" }}
        />
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
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (campaign?.organizerId)
                navigate(`/organizers/${campaign.organizerId}`);
            }}
            role="button"
            aria-label="View organizer profile"
          >
            <div className="w-10 h-10 bg-[color:var(--color-muted)] rounded-lg flex items-center justify-center overflow-hidden">
              {organizerAvatarUrl ? (
                <img
                  src={organizerAvatarUrl}
                  alt="Organizer avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-[color:var(--color-primary-text)]">
                  {campaign.organizerName?.[0]?.toUpperCase() || "O"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap">
              <h2 className="font-bold text-base sm:text-lg md:text-xl text-[color:var(--color-primary-text)] break-words whitespace-pre-line w-full">
                {campaign.organizerName ||
                  organizerProfile?.organizationName ||
                  organizerProfile?.firstName ||
                  "Organization"}
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
                <div className="text-[color:var(--color-primary-text)] leading-relaxed">
                  {showFullMessage ? (
                    <div
                      className="formatted-text"
                      dangerouslySetInnerHTML={{
                        __html:
                          campaign.customPageSettings?.message ||
                          campaign.description,
                      }}
                    />
                  ) : (
                    <div
                      className="formatted-text"
                      dangerouslySetInnerHTML={{
                        __html: truncateMessage(
                          campaign.customPageSettings?.message ||
                            campaign.description
                        ),
                      }}
                    />
                  )}
                </div>
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

            {/* Campaign Categories */}
            {campaign?.categories && campaign.categories.length > 0 && (
              <div className="px-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {campaign.categories.map((category) => (
                    <span
                      key={category.categoryId}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        border: `1px solid ${themeColor}40`,
                        color: themeColor,
                      }}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                  {donationStats.completedDonations || 0} supporters
                </span>
              </div>
            </div>

            {/* Words of Support */}
            <WordsOfSupport
              themeColor={themeColor}
              campaignId={campaign.campaignId}
            />
          </div>

          {/* Right Section - 1 column */}
          <div className="space-y-2 pt-13">
            {/* Donation Section */}
            <div ref={donationSectionRef}>
              <DonationSection
                raisedAmount={campaign.currentRaisedAmount || 0}
                goalAmount={campaign.goalAmount}
                progress={progress}
                donationCount={donationStats.completedDonations || 0}
                predefinedAmounts={predefinedAmounts}
                themeColor={themeColor}
                formatAmount={formatAmount}
                campaign={campaign}
                onDonateClick={handleDonateClick}
              />
            </div>

            {/* Recent Donations */}
            <RecentDonations
              themeColor={themeColor}
              campaignId={campaign.campaignId}
            />

            {/* Success Stories */}
            <SuccessStories
              themeColor={themeColor}
              campaignId={campaign.campaignId}
            />

            {/* Quick Donation */}
            <QuickDonation
              themeColor={themeColor}
              onDonateClick={() => handleDonateClick("50")}
            />

            {/* Auth Prompt for Guests (Mobile bottom) */}
            <GuestAuthPrompt themeColor={themeColor} />
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
              donationCount={donationStats.completedDonations || 0}
              predefinedAmounts={predefinedAmounts}
              themeColor={themeColor}
              formatAmount={formatAmount}
              campaign={campaign}
              onDonateClick={handleDonateClick}
            />
          </div>

          {/* Campaign Message */}
          <div className="bg-[color:var(--color-background)] rounded-lg p-4">
            <div className="prose max-w-none">
              <div className="text-[color:var(--color-primary-text)] leading-relaxed">
                {showFullMessage ? (
                  <div
                    className="formatted-text"
                    dangerouslySetInnerHTML={{
                      __html:
                        campaign.customPageSettings?.message ||
                        campaign.description,
                    }}
                  />
                ) : (
                  <div
                    className="formatted-text"
                    dangerouslySetInnerHTML={{
                      __html: truncateMessage(
                        campaign.customPageSettings?.message ||
                          campaign.description
                      ),
                    }}
                  />
                )}
              </div>
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

          {/* Campaign Categories */}
          {campaign?.categories && campaign.categories.length > 0 && (
            <div className="px-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {campaign.categories.map((category) => (
                  <span
                    key={category.categoryId}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      border: `1px solid ${themeColor}40`,
                      color: themeColor,
                    }}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

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
                {donationStats.completedDonations || 0} supporters
              </span>
            </div>
          </div>

          {/* Recent Donations */}
          <RecentDonations
            themeColor={themeColor}
            campaignId={campaign.campaignId}
          />

          {/* Words of Support */}
          <WordsOfSupport
            themeColor={themeColor}
            campaignId={campaign.campaignId}
          />

          {/* Success Stories */}
          <SuccessStories
            themeColor={themeColor}
            campaignId={campaign.campaignId}
          />
          <GuestAuthPrompt themeColor={themeColor} />
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
        isProcessing={isProcessingDonation}
        campaignStatus={campaign?.status}
        campaignEndDate={campaign?.endDate}
        campaignStartDate={campaign?.startDate}
      />

      {/* Payment Result Modal */}
      <PaymentResultModal
        isOpen={showPaymentResultModal}
        onClose={() => setShowPaymentResultModal(false)}
        themeColor={themeColor}
        providerLabel={providerLabel}
        isProcessing={
          paymentPhase === "processing" || paymentPhase === "polling"
        }
        errorMessage={paymentResultError}
        title="Payment Result"
      />

      {/* Thank You Modal on success */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={handleThankYouClose}
        donationDetails={donationDetails}
        themeColor={themeColor}
        formatAmount={formatAmount}
      />
    </div>
  );
}

export default CampaignTemplatePage;
