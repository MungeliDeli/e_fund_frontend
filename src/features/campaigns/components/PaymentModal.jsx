import React, { useState } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import airtelLogo from "../../../assets/airtel_logo.png";
import mtnLogo from "../../../assets/mtn_logo.png";
import { useAuth } from "../../../contexts/AuthContext.jsx";

function PaymentModal({
  isOpen,
  onClose,
  amount,
  themeColor,
  formatAmount,
  onDonate,
  campaignStatus = "active",
  campaignEndDate = null,
  campaignStartDate = null,
}) {
  const { isAuthenticated } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("airtel");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [donateAnonymously, setDonateAnonymously] = useState(
    () => !isAuthenticated
  );
  const [subscribeToCampaign, setSubscribeToCampaign] = useState(
    () => !!isAuthenticated
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Validation functions
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      return "Amount must be a valid number";
    }
    if (numAmount <= 0) {
      return "Amount must be greater than 0";
    }
    if (numAmount < 0.01) {
      return "Amount must be at least K0.01";
    }
    if (numAmount > 999999.99) {
      return "Amount cannot exceed K999,999.99";
    }
    return null;
  };

  const validatePhoneNumber = (phone) => {
    if (!phone || !phone.trim()) {
      return "Phone number is required";
    }

    const cleanPhone = phone.trim();

    // Check if phone number matches the selected payment method
    if (selectedPaymentMethod === "airtel") {
      // Airtel numbers: 097 or 077 (with or without leading 0)
      const airtelRegex = /^(0?97|0?77)\d{7}$/;
      if (!airtelRegex.test(cleanPhone)) {
        return "Airtel Money requires a number starting with 097 or 077 (e.g., 0978882033 or 978882033)";
      }
    } else if (selectedPaymentMethod === "mtn") {
      // MTN numbers: 096 or 076 (with or without leading 0)
      const mtnRegex = /^(0?96|0?76)\d{7}$/;
      if (!mtnRegex.test(cleanPhone)) {
        return "MTN Mobile Money requires a number starting with 096 or 076 (e.g., 0968882033 or 968882033)";
      }
    }

    return null;
  };

  const validateMessage = (messageText) => {
    if (messageText && messageText.length > 1000) {
      return "Message cannot exceed 1000 characters";
    }

    // Check for potentially harmful content
    const harmfulPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(messageText)) {
        return "Message contains potentially harmful content";
      }
    }
    return null;
  };

  const validateCampaignState = () => {
    if (campaignStatus !== "active") {
      return `Campaign is not accepting donations. Current status: ${campaignStatus}`;
    }

    return null;
  };

  const handleDonate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const newErrors = {};

    // Validate all fields
    const amountError = validateAmount(amount);
    const phoneError = validatePhoneNumber(phoneNumber);
    const messageError = validateMessage(message);
    const campaignError = validateCampaignState();

    if (amountError) newErrors.amount = amountError;
    if (phoneError) newErrors.phoneNumber = phoneError;
    if (messageError) newErrors.message = messageError;
    if (campaignError) newErrors.campaign = campaignError;

    setErrors(newErrors);

    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Format phone number for backend - ensure consistent formatting
      let formattedPhone = phoneNumber.trim();

      // Add leading 0 if missing (user might enter 978882033 instead of 0978882033)
      if (
        !formattedPhone.startsWith("0") &&
        !formattedPhone.startsWith("+260")
      ) {
        formattedPhone = "0" + formattedPhone;
      }

      // Add +260 prefix if not present
      if (!formattedPhone.startsWith("+260")) {
        formattedPhone = "+260" + formattedPhone;
      }

      const isAnonEffective = isAuthenticated ? donateAnonymously : true;
      const subscribeEffective = isAuthenticated ? subscribeToCampaign : false;

      await onDonate({
        amount: parseFloat(amount),
        paymentMethod: selectedPaymentMethod,
        phoneNumber: formattedPhone,
        messageText: message.trim() || undefined,
        isAnonymous: isAnonEffective,
        subscribeToCampaign: subscribeEffective,
        currency: "ZMW",
        gatewayUsed:
          selectedPaymentMethod === "airtel"
            ? "airtel_money"
            : "mtn_mobile_money",
        gatewayTransactionId: `FRONTEND_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      });
      // After initiation succeeds, clear fields to avoid accidental resubmits
      setPhoneNumber("");
      setMessage("");
      // Keep donateAnonymously and subscribe selections as they are
    } catch (error) {
      console.error("Donation failed:", error);
      setErrors({
        general:
          error.message || "Failed to process donation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 "
        style={{ backgroundColor: "rgba(0, 0, 0, 0.68)" }}
      />

      {/* Modal */}
      <div className="relative bg-[color:var(--color-background)] rounded-xl w-full max-w-lg shadow-[0_2px_16px_0_var(--color-shadow)] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b mx-2"
          style={{ borderColor: themeColor }}
        >
          <h2 className="text-xl font-semibold" style={{ color: themeColor }}>
            Payment Method
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[color:var(--color-muted)] rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-[color:var(--color-secondary-text)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 hide-scrollbar">
          {/* Campaign State Error */}
          {errors.campaign && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <FiAlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.campaign}</p>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <FiAlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          {/* Payment Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[color:var(--color-primary-text)]">
              Select Payment Method:
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Airtel Money */}
              <button
                onClick={() => {
                  setSelectedPaymentMethod("airtel");
                  // Clear phone number error when switching payment methods
                  if (errors.phoneNumber) {
                    setErrors((prev) => ({ ...prev, phoneNumber: null }));
                  }
                }}
                className={`p-4 rounded-lg transition-all ${
                  selectedPaymentMethod === "airtel"
                    ? "border-1 border-[color:var(--color-primary)] shadow-md"
                    : "border border-[color:var(--color-muted)] bg-[color:var(--color-background)] shadow-[0_2px_16px_0_var(--color-shadow)] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={airtelLogo}
                    alt="Airtel Money"
                    className="h-8 w-auto"
                  />
                  <span className="text-xs text-[color:var(--color-secondary-text)]">
                    airtel money
                  </span>
                </div>
              </button>

              {/* MTN Mobile Money */}
              <button
                onClick={() => {
                  setSelectedPaymentMethod("mtn");
                  // Clear phone number error when switching payment methods
                  if (errors.phoneNumber) {
                    setErrors((prev) => ({ ...prev, phoneNumber: null }));
                  }
                }}
                className={`p-4 rounded-lg transition-all ${
                  selectedPaymentMethod === "mtn"
                    ? "border-1 border-[color:var(--color-primary)] shadow-md"
                    : "border border-[color:var(--color-muted)] shadow-[0_2px_16px_0_var(--color-shadow)] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={mtnLogo}
                    alt="MTN Mobile Money"
                    className="h-8 w-auto"
                  />
                  <span className="text-xs text-[color:var(--color-secondary-text)]">
                    MTN Mobile Money
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Donation Summary */}
          <div className="space-y-2 p-4 bg-[color:var(--color-background)] rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[color:var(--color-primary-text)]">
                You are donating:
              </span>
              <div className="flex flex-col items-end">
                <span
                  className="text-lg font-semibold"
                  style={{ color: themeColor }}
                >
                  {formatAmount(amount)}
                </span>
                {errors.amount && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.amount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[color:var(--color-primary-text)]">
                Payment Option:
              </span>
              <span
                className="text-sm font-medium px-2 py-1 rounded"
                style={{
                  color:
                    selectedPaymentMethod === "airtel" ? "#FF0000" : "#FFCC08",
                }}
              >
                {selectedPaymentMethod === "airtel"
                  ? "Airtel Money"
                  : "MTN Mobile Money"}
              </span>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-primary-text)]">
              Phone Number: <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <select className="px-3 py-3 border border-[color:var(--color-muted)] border-r-0 rounded-l-lg bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] focus:outline-none">
                <option>+260</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) {
                    setErrors((prev) => ({ ...prev, phoneNumber: null }));
                  }
                }}
                className={`flex-1 px-3 py-3 border rounded-r-lg bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] focus:outline-none ${
                  errors.phoneNumber
                    ? "border-red-500 focus:border-red-500"
                    : "border-[color:var(--color-muted)] focus:border-[color:var(--color-primary)]"
                }`}
                placeholder={
                  selectedPaymentMethod === "airtel"
                    ? "097XXXXXXXX or 077XXXXXXXX"
                    : "096XXXXXXXX or 076XXXXXXXX"
                }
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <FiAlertTriangle className="w-3 h-3" />
                {errors.phoneNumber}
              </p>
            )}
            <p className="text-xs text-[color:var(--color-secondary-text)]">
              {selectedPaymentMethod === "airtel"
                ? "Enter your Airtel Money number (starts with 097 or 077)"
                : "Enter your MTN Mobile Money number (starts with 096 or 076)"}
            </p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-primary-text)]">
              Message (Optional):
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) {
                    setErrors((prev) => ({ ...prev, message: null }));
                  }
                }}
                maxLength={1000}
                rows={3}
                className={`w-full px-3 py-3 border rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] focus:outline-none resize-none ${
                  errors.message
                    ? "border-red-500 focus:border-red-500"
                    : "border-[color:var(--color-muted)] focus:border-[color:var(--color-primary)]"
                }`}
                placeholder="Leave a message for the campaign organizer (max 1000 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-[color:var(--color-secondary-text)]">
                  Share your thoughts or encouragement
                </span>
                <span
                  className={`text-xs ${
                    message.length > 900
                      ? "text-red-500"
                      : "text-[color:var(--color-secondary-text)]"
                  }`}
                >
                  {message.length}/1000
                </span>
              </div>
              {errors.message && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <FiAlertTriangle className="w-3 h-3" />
                  {errors.message}
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-[color:var(--color-background)] rounded-lg">
            <p className="text-xs text-[color:var(--color-secondary-text)] leading-relaxed">
              An approval request will be sent to your phone. Enter your Mobile
              Money pin to approve the transaction.
            </p>
          </div>

          {/* Checkboxes: only for authenticated users */}
          {isAuthenticated && (
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={donateAnonymously}
                  onChange={(e) => setDonateAnonymously(e.target.checked)}
                  className="w-4 h-4 rounded border-[color:var(--color-muted)] focus:ring-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)] checked:border-[color:var(--color-primary)]"
                  style={{
                    accentColor: themeColor,
                  }}
                />
                <span className="text-sm text-[color:var(--color-primary-text)]">
                  Donate Anonymously
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribeToCampaign}
                  onChange={(e) => setSubscribeToCampaign(e.target.checked)}
                  className="w-4 h-4 rounded border-[color:var(--color-muted)] focus:ring-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)] checked:border-[color:var(--color-primary)]"
                  style={{
                    accentColor: themeColor,
                  }}
                />
                <span className="text-sm text-[color:var(--color-primary-text)]">
                  Subscribe to this campaign
                </span>
              </label>
            </div>
          )}

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={isSubmitting || !!errors.campaign}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
              isSubmitting || errors.campaign
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-90"
            }`}
            style={{ backgroundColor: themeColor }}
          >
            {isSubmitting ? "Processing..." : "Donate"}
          </button>

          {/* Legal Disclaimer */}
          <p className="text-xs text-[color:var(--color-secondary-text)] text-center leading-relaxed">
            By clicking 'Donate now', you agree to FundFlow's{" "}
            <a
              href="#"
              className="underline hover:text-[color:var(--color-primary)]"
              style={{ color: themeColor }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline hover:text-[color:var(--color-primary)]"
              style={{ color: themeColor }}
            >
              Privacy Notice
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
