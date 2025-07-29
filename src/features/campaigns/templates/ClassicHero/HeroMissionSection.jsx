import React from "react";
import heroImg from "./templateAssets/hero image.jpg"; // Example hero image path

const HeroMissionSection = ({ config }) => {
  const heroSection = config.sections?.find((s) => s.key === "hero");
  const globaeBg = config.theme.backgroundColor;
  const globaeTextColor = config.theme.textColor;

  const title = heroSection?.content?.title;
  const subtitle = heroSection?.content?.subtitle;
  const image = heroSection?.content?.image || heroImg;
  const mission = heroSection?.content?.mission;
  const bgColor = heroSection?.backgroundColor || globaeBg;
  const textColor = heroSection?.textColor || globaeTextColor;

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
        src={image}
        alt="Hero"
        className="w-full h-64 object-cover rounded-lg border"
        style={{ background: "#eee" }}
      />
      <div className="text-base mt-2" style={{ opacity: 0.8 }}>
        {mission}
      </div>
    </section>
  );
};

export default HeroMissionSection;
