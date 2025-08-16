import React, { useState } from "react";

const DonationFormSection = ({ config }) => {
  const [donationAmount, setDonationAmount] = useState("");
  const [message, setMessage] = useState("");
  const section = config.sections?.find((s) => s.key === "donationForm");

  const bgColor = config.theme.backgroundColor;
  const textColor = config.theme.textColor;
  const accentColor = config.theme.accentColor;

  const presetAmounts = section?.content?.presetAmounts || [
    500, 200, 100, 50, 20, 5,
  ];

  const handlePresetClick = (amount) => {
    setDonationAmount(amount.toString());
  };

  const handleDonate = () => {
    // TODO: Implement donation logic
    console.log("Donation:", { amount: donationAmount, message });
  };

  return (
    <section
      className={`donation-form-section mt-4`}
      style={{ background: bgColor, color: textColor }}
    >
      <div className="font-semibold mb-2">Make Donation</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {presetAmounts.map((amt, idx) => (
          <button
            key={amt + idx}
            className="px-3 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              border: `1px solid ${textColor}`,
              background:
                donationAmount === amt.toString() ? accentColor : "transparent",
              color: donationAmount === amt.toString() ? "#ffffff" : textColor,
            }}
            onClick={() => handlePresetClick(amt)}
          >
            K{amt}.00
          </button>
        ))}
      </div>
      <input
        type="number"
        value={donationAmount}
        onChange={(e) => setDonationAmount(e.target.value)}
        className="w-full mb-2 p-2 outline-none rounded"
        placeholder="k 50.00"
        style={{ color: textColor, border: `1px solid ${textColor}` }}
      />
      <div className="mb-2" style={{ opacity: 0.8 }}>
        Leave a message
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full mb-2 p-2 outline-none rounded"
        placeholder="Leave a Message"
        style={{ color: textColor, border: `1px solid ${textColor}` }}
      />
      <button
        onClick={handleDonate}
        disabled={!donationAmount || parseFloat(donationAmount) <= 0}
        className="w-full py-2 text-white rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        style={{ background: accentColor }}
      >
        Donate
      </button>
    </section>
  );
};

export default DonationFormSection;
