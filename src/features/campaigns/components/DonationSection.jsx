import React, { useState } from "react";
import { FiInfo, FiAlertTriangle } from "react-icons/fi";

function DonationSection({
  raisedAmount,
  goalAmount,
  progress,
  donationCount,
  predefinedAmounts,
  themeColor,
  formatAmount,
  campaign = null,
  onDonateClick = null,
}) {
  const [selectedAmount, setSelectedAmount] = useState(predefinedAmounts[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [amountError, setAmountError] = useState("");

  const handlePredefinedAmountClick = (amount) => {
    setSelectedAmount(amount);
    setIsCustomSelected(false);
    setCustomAmount("");
  };

  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (!amount || amount === "" || isNaN(numAmount)) {
      return "Please enter a valid amount";
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
    return "";
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setIsCustomSelected(true);
    setSelectedAmount(null);

    // Validate amount and show error immediately
    const error = validateAmount(value);
    setAmountError(error);
  };

  const handleDonate = () => {
    const amount = isCustomSelected ? customAmount : selectedAmount;

    // Validate amount
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }

    // Check campaign state
    if (campaign) {
      if (campaign.status !== "active") {
        setAmountError(
          `Campaign is not accepting donations. Status: ${campaign.status}`
        );
        return;
      }

      if (campaign.endDate && new Date(campaign.endDate) < new Date()) {
        setAmountError(
          "Campaign has ended and is no longer accepting donations"
        );
        return;
      }

      if (campaign.startDate && new Date(campaign.startDate) > new Date()) {
        setAmountError("Campaign has not started yet");
        return;
      }
    }

    setAmountError("");

    // Call parent's onDonateClick with the selected amount
    if (onDonateClick) {
      onDonateClick(amount);
    }
  };

  return (
    <div className="bg-[color:var(--color-background)]  rounded-lg p-6 space-y-6 shadow-[0_2px_16px_0_var(--color-shadow)]">
      {/* Raised Amount and Goal */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <div
            className="text-xl sm:text-2xl font-bold"
            style={{ color: themeColor }}
          >
            {formatAmount(raisedAmount)}
          </div>
          <div className="text-sm" style={{ color: themeColor }}>
            Raised
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-lg text-[color:var(--color-text)]  font-semibold ">
            {formatAmount(goalAmount)}
          </div>
          <div className="text-sm text-[color:var(--color-text)] ">Goal</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <div className="w-[90%] bg-[color:var(--color-surface)] rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: themeColor,
              }}
            />
          </div>
          <span className="absolute right-0 top-[-5px] text-sm font-medium text-[color:var(--color-text)]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="flex justify-start">
          <span className="text-sm text-[color:var(--color-text)]">
            {donationCount} donations
          </span>
        </div>
      </div>

      {/* Donation Form */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold" style={{ color: themeColor }}>
          Choose Amount:
        </h3>

        {/* Predefined Amounts */}
        <div className="grid grid-cols-4 gap-3">
          {predefinedAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePredefinedAmountClick(amount)}
              className={`py-2 px-4 rounded-lg border font-semibold transition-all `}
              style={{
                borderColor:
                  selectedAmount === amount && !isCustomSelected
                    ? themeColor
                    : `${themeColor}40`,
                backgroundColor:
                  selectedAmount === amount && !isCustomSelected
                    ? themeColor
                    : "bg-[color:var(--color-background)]",
                color:
                  selectedAmount === amount && !isCustomSelected
                    ? "white"
                    : themeColor,
              }}
            >
              {formatAmount(amount)}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomAmountChange}
            onFocus={() => {
              setIsCustomSelected(true);
              setAmountError("");
            }}
            placeholder="other amount"
            min="0.01"
            max="999999.99"
            step="0.01"
            className={`w-full px-4 py-3 border rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none transition-colors ${
              amountError && isCustomSelected
                ? "border-red-500 focus:border-red-500"
                : isCustomSelected
                ? `border-[color:var(--color-primary)]`
                : `border-[color:var(--color-primary)] focus:border-[color:var(--color-primary)]`
            }`}
            style={{
              borderColor:
                amountError && isCustomSelected
                  ? "#ef4444"
                  : isCustomSelected
                  ? themeColor
                  : `${themeColor}40`,
            }}
          />
          {amountError && isCustomSelected && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <FiAlertTriangle className="w-3 h-3" />
              {amountError}
            </p>
          )}
        </div>

        {/* Receipt Notice */}
        <div
          className="p-3 rounded-lg flex items-start gap-2"
          style={{
            backgroundColor: `${themeColor}15`,
            color: themeColor,
          }}
        >
          <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            You will receive a receipt for this donation
          </p>
        </div>

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={!!amountError}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            amountError ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}
          style={{
            backgroundColor: themeColor,
          }}
        >
          Donate
        </button>
      </div>
    </div>
  );
}

export default DonationSection;
