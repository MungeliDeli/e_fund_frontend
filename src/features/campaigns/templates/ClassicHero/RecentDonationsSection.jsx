import React from "react";

const RecentDonationsSection = ({ config }) => {
  const section = config.sections?.find((s) => s.key === "recentDonations");
  if (!section?.visible) return null;
  const bgColor = config.theme.backgroundColor;
  const textColor = config.theme.textColor;
  const accentColor = config.theme.accentColor;

  const donations = section.content?.donations || [
    {
      name: "Davy Mwansa",
      message: "Thanks for all of the work you're doing in our community",
      amount: "K200.00",
      location: "Zambia, Lusaka",
    },
    {
      name: "Dorcas Mwale",
      message:
        "Glad to contribute to your vital work providing shelter in Lusaka. Every bit helps.",
      amount: "K2.00",
      location: "Zambia, Lusaka",
    },
  ];

  return (
    <section
      className="recent-donations-section mt-4"
      style={{ background: bgColor, color: textColor }}
    >
      <div className="font-semibold mb-2">Recent Donations</div>
      <div className="flex flex-col gap-2">
        {donations.map((don, idx) => (
          <div
            key={don.name + idx}
            className="p-2  rounded flex justify-between items-center"
            style={{ border: `1px solid ${textColor}` }}
          >
            <div>
              <div className="font-medium">{don.name}</div>
              <div className="text-xs " style={{ opacity: 0.8 }}>
                "{don.message}"
              </div>
              <div className="text-xs  flex items-center gap-1">
                {don.location}
              </div>
            </div>
            <div className="font-bold  whitespace-nowrap">{don.amount}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentDonationsSection;
