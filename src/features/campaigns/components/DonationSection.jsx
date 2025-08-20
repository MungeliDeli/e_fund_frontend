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
    <div className="bg-white rounded-lg p-6 space-y-6 shadow-sm border border-gray-100">
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
          <div className="text-lg font-semibold text-black">
            {formatAmount(goalAmount)}
          </div>
          <div className="text-sm text-gray-600">Goal</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: themeColor,
              }}
            />
          </div>
          <span className="absolute right-0 top-0 text-sm font-medium text-black">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="flex justify-start">
          <span className="text-sm text-gray-500">
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
              className={`py-2 px-4 rounded-lg border font-semibold transition-all ${
                selectedAmount === amount && !isCustomSelected
                  ? "text-white"
                  : "bg-white text-green-600 border-green-300"
              }`}
              style={{
                borderColor:
                  selectedAmount === amount && !isCustomSelected
                    ? themeColor
                    : `${themeColor}40`,
                backgroundColor:
                  selectedAmount === amount && !isCustomSelected
                    ? themeColor
                    : "white",
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
            className={`w-full px-4 py-3 border rounded-lg bg-white text-black focus:outline-none transition-colors ${
              isCustomSelected
                ? "border-green-600"
                : "border-green-300 focus:border-green-600"
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
