import React from "react";

const DonationFormSection = ({ config }) => {
  const section = config.sections?.find((s) => s.key === "donationForm");

  const bgColor = config.theme.backgroundColor;
  const textColor = config.theme.textColor;
  const accentColor = config.theme.accentColor;

  const presetAmounts = section?.content?.presetAmounts || [
    500, 200, 100, 50, 20, 5,
  ];

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
            className="px-3 py-1  rounded"
            style={{ border: `1px solid ${textColor}` }}
          >
            K{amt}.00
          </button>
        ))}
      </div>
      <input
        type="number"
        className="w-full mb-2 p-2 outline-none rounded"
        placeholder="k 50.00"
        style={{ color: textColor, border: `1px solid ${textColor}` }}
      />
      <div className="mb-2" style={{ opacity: 0.8 }}>
        Leave a message
      </div>
      <textarea
        className="w-full mb-2 p-2 outline-none  rounded"
        placeholder="Leave a Message"
        style={{ color: textColor, border: `1px solid ${textColor}` }}
      />
      <button
        className="w-full py-2  text-white rounded font-bold"
        style={{ background: accentColor }}
      >
        Donate
      </button>
    </section>
  );
};

export default DonationFormSection;
