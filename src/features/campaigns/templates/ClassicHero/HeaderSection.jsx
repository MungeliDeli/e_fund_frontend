import React from "react";
import weLogo from "./templateAssets/organizerLogo.png";
import { FiX, FiLinkedin, FiFacebook } from "react-icons/fi";

const HeaderSection = ({ config }) => {
  const headerSection = config.sections?.find((s) => s.key === "hero");

  const orgName = config?.orgName || "Relief Operations Internations";
  const logo = config?.logo || weLogo;
  const globaeBg = config.theme.backgroundColor;
  const globaeTextColor = config.theme.textColor;
  const bgColor = headerSection?.backgroundColor || globaeBg;
  const textColor = headerSection?.textColor || globaeTextColor;

  return (
    <header
      className="header-section flex items-center gap-2 sm:gap-4 py-2 px-1 min-w-0 flex-wrap"
      style={{ background: bgColor, color: textColor }}
    >
      <img
        src={logo}
        alt="Org Logo"
        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-contain bg-transparent flex-shrink-0"
      />
      <div
        className="font-semibold text-md  min-w-0 whitespace-normal leading-tight flex-1"
        title={orgName}
      >
        {orgName}
      </div>
      <div className="flex gap-2 ml-auto items-center flex-shrink-0">
        <a href="#" className="p-1  rounded" aria-label="LinkedIn">
          <FiLinkedin size={20} className="" />
        </a>
        <a href="#" className="p-1  rounded" aria-label="Facebook">
          <FiFacebook size={20} className="" />
        </a>
      </div>
    </header>
  );
};

export default HeaderSection;
