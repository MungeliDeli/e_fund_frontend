import React from "react";
import heroImg from "./templateAssets/hero image.jpg"; // Example hero image path

const HeroMissionSection = ({ config }) => {
  const heroSection = config.sections?.find((s) => s.key === "hero");
  const bgColor = config.theme.backgroundColor;
  const textColor = config.theme.textColor;

  const title = heroSection?.content?.title;
  const subtitle = heroSection?.content?.subtitle;
  const imageData = heroSection?.content?.image || heroImg;
  const mission = heroSection?.content?.mission;

  // Handle image data - could be a string URL or an object with metadata
  const imageUrl =
    typeof imageData === "object" && imageData?.url ? imageData.url : imageData;

  return (
    <section
      className="hero-mission-section flex flex-col gap-4 rounded-lg p-4"
      style={{ background: bgColor, color: textColor }}
    >
      <div className="text-3xl font-bold leading-tight">{title}</div>
      {subtitle && (
        <div className="text-lg  mb-2" style={{ opacity: 0.8 }}>
          {subtitle}
        </div>
      )}
      <img
        src={imageUrl}
        alt="Hero"
        className="w-full h-100 object-cover rounded-lg "
        style={{ background: "#eee" }}
      />
      <div className="text-base mt-2" style={{ opacity: 0.8 }}>
        {mission}
      </div>
    </section>
  );
};

export default HeroMissionSection;
