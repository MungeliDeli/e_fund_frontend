import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";
import PaymentModal from "./PaymentModal";

function DonationSection({
  raisedAmount,
  goalAmount,
  progress,
  donationCount,
  predefinedAmounts,
  themeColor,
  formatAmount,
}) {
  const [selectedAmount, setSelectedAmount] = useState(predefinedAmounts[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePredefinedAmountClick = (amount) => {
    setSelectedAmount(amount);
    setIsCustomSelected(false);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setIsCustomSelected(true);
    setSelectedAmount(null);
  };

  const handleDonate = () => {
    const amount = isCustomSelected ? customAmount : selectedAmount;
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (paymentData) => {
    // TODO: Implement donation processing
    console.log("Payment data:", paymentData);
    alert(`Donation of ${formatAmount(paymentData.amount)} initiated!`);
    setShowPaymentModal(false);
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
            onFocus={() => setIsCustomSelected(true)}
            placeholder="other amount"
            min="1"
            step="1"
            className={`w-full px-4 py-3 border rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)] focus:outline-none transition-colors ${
              isCustomSelected
                ? `border-[color:var(--color-primary)]`
                : `border-[color:var(--color-primary)] focus:border-[color:var(--color-primary)]`
            }`}
            style={{
              borderColor: isCustomSelected ? themeColor : `${themeColor}40`,
            }}
          />
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
          className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: themeColor,
          }}
        >
          Donate
        </button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={isCustomSelected ? customAmount : selectedAmount}
        themeColor={themeColor}
        formatAmount={formatAmount}
        onDonate={handlePaymentSubmit}
      />
    </div>
  );
}

export default DonationSection;
