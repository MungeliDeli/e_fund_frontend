import React, { useState, useEffect } from "react";
import HeaderSection from "./HeaderSection";
import HeroMissionSection from "./HeroMissionSection";
import MajorDonorsSection from "./MajorDonorsSection";
import RecentDonationsSection from "./RecentDonationsSection";
import SuccessStoriesSection from "./SuccessStoriesSection";
import GoalMeterSection from "./GoalMeterSection";
import DonationFormSection from "./DonationFormSection";
import SignupPrompt from "./SignupPrompt";
import ResponsiveDonationModal from "./ResponsiveDonationModal";

// Receives config: { theme, sections }
const ClassicHeroTemplate = ({ config }) => {
  // Responsive state for mobile signup banner
  const [showSignup, setShowSignup] = useState(false);
  // Show signup banner on mobile after delay, auto-hide after 6s
  useEffect(() => {
    const timer = setTimeout(() => setShowSignup(true), 20000); // 2s delay
    let hideTimer;
    if (showSignup) {
      hideTimer = setTimeout(() => setShowSignup(false), 6000); // 6s visible
    }
    return () => {
      clearTimeout(timer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [showSignup]);

  // Helper to detect mobile (tailwind: <lg)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Main render
  return (
    <div
      className="classic-hero-template min-h-screen w-full  "
      style={{ background: config?.theme?.backgroundColor || "#000" }}
    >
      {/* Signup sliding banner on mobile */}
      {isMobile && (
        <SignupPrompt config={config} mobileBanner={true} show={showSignup} />
      )}
      {/* Desktop layout: grid, mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-3  w-full max-w-7xl mx-auto p-2 lg:p-6">
        {/* Main Content (2/3 on desktop, all on mobile) */}
        <div className="col-span-2 flex flex-col ">
          <HeaderSection config={config} />
          <HeroMissionSection config={config} />
          {/* On mobile, goal meter and donation form come next */}
          <div className="block lg:hidden flex flex-col gap-4">
            <GoalMeterSection config={config} />
            <DonationFormSection config={config} />
          </div>
          <MajorDonorsSection config={config} />
          <RecentDonationsSection config={config} />
          {/* On mobile, success stories at the end */}
          <div className="block lg:hidden">
            <SuccessStoriesSection config={config} />
          </div>
        </div>
        {/* Sidebar (1/3) on desktop only */}
        <aside className="hidden lg:flex flex-col gap-4 p-4  rounded-lg ">
          <SignupPrompt config={config} />
          <SuccessStoriesSection config={config} />
          <GoalMeterSection config={config} />
          <DonationFormSection config={config} />
        </aside>
        {/* Responsive Donation Modal (hidden on desktop, placeholder for now) */}
        <ResponsiveDonationModal config={config} />
      </div>
    </div>
  );
};

export default ClassicHeroTemplate;
