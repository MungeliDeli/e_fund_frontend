import React from "react";
import yangoLogo from "./templateAssets/yango-logo.png";
import libraryshhLogo from "./templateAssets/libraryshh-logo.png";
import chalochesuLogo from "./templateAssets/chalochesu-logo.png";
import bLogo from "./templateAssets/b-logo.png";

const donorAssets = {
  Yango: yangoLogo,
  Libraryshh: libraryshhLogo,
  ChaloChesu: chalochesuLogo,
  B: bLogo,
};

const MajorDonorsSection = ({ config }) => {
  const section = config.sections?.find((s) => s.key === "majorDonors");
  if (!section?.visible) return null;
  const bgColor = config.theme.backgroundColor;
  const textColor = config.theme.textColor;
  const donors = section.content?.donors || [
    { name: "Yango", logo: donorAssets.Yango },
    { name: "Libraryshh", logo: donorAssets.Libraryshh },
    { name: "ChaloChesu", logo: donorAssets.ChaloChesu },
    { name: "B", logo: donorAssets.B },
  ];

  return (
    <section
      className="major-donors-section mt-4"
      style={{ background: bgColor, color: textColor }}
    >
      <div className="font-semibold mb-2">Major Donors</div>
      <div className="flex gap-6 items-center flex-wrap">
        {donors.map((donor, idx) => (
          <img
            key={donor.name + idx}
            src={donor.logo}
            alt={donor.name}
            className="h-8 object-contain  rounded  px-2"
            style={{ maxWidth: 100 }}
          />
        ))}
      </div>
    </section>
  );
};

export default MajorDonorsSection;
