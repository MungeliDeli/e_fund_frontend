import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";

function DonationSection({ 
  raisedAmount, 
  goalAmount, 
  progress, 
  donationCount, 
  predefinedAmounts, 
  themeColor,
  formatAmount 
}) {
  const [selectedAmount, setSelectedAmount] = useState(predefinedAmounts[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);

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
    
    // TODO: Implement donation processing
    console.log("Donating:", amount);
    alert(`Donation of ${formatAmount(amount)} initiated!`);
  };

  return (
    <div className="bg-[color:var(--color-surface)] rounded-lg p-6 space-y-6">
      {/* Raised Amount and Goal */}
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: themeColor }}>
            {formatAmount(raisedAmount)}
          </div>
          <div className="text-sm text-[color:var(--color-secondary-text)]">raised</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-[color:var(--color-primary-text)]">
            {formatAmount(goalAmount)}
          </div>
          <div className="text-sm text-[color:var(--color-secondary-text)]">goal</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-[color:var(--color-muted)] rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: themeColor 
            }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[color:var(--color-secondary-text)]">
            {donationCount} donations
          </span>
          <span className="text-sm font-medium" style={{ color: themeColor }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Donation Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: themeColor }}>
          Choose Amount
        </h3>

        {/* Predefined Amounts */}
        <div className="grid grid-cols-2 gap-3">
          {predefinedAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePredefinedAmountClick(amount)}
              className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                selectedAmount === amount && !isCustomSelected
                  ? 'text-white'
                  : 'bg-transparent'
              }`}
              style={{
                borderColor: themeColor,
                backgroundColor: selectedAmount === amount && !isCustomSelected ? themeColor : 'transparent',
                color: selectedAmount === amount && !isCustomSelected ? 'white' : themeColor
              }}
            >
              {formatAmount(amount)}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[color:var(--color-primary-text)]">
            Other Amount
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomAmountChange}
            onFocus={() => setIsCustomSelected(true)}
            placeholder="Enter amount"
            min="1"
            step="1"
            className={`w-full px-4 py-3 border-2 rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] focus:outline-none transition-colors ${
              isCustomSelected
                ? 'border-[color:var(--campaign-theme-color)]'
                : 'border-[color:var(--color-muted)] focus:border-[color:var(--campaign-theme-color)]'
            }`}
            style={{
              borderColor: isCustomSelected ? themeColor : undefined
            }}
          />
        </div>

        {/* Receipt Notice */}
        <div 
          className="p-3 rounded-lg flex items-start gap-2"
          style={{ 
            backgroundColor: `${themeColor}15`,
            color: themeColor 
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
            focusRingColor: themeColor
          }}
        >
          Donate
        </button>
      </div>
    </div>
  );
}

export default DonationSection;