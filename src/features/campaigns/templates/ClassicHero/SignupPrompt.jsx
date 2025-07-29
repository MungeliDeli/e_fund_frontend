import React, { useEffect, useState } from "react";

const SignupPrompt = ({ config, mobileBanner = false, show = true }) => {
  const bgColor = config.theme.backgroundColor;
  const textColor = config.theme.textColor;
  const accentColor = config.theme.accentColor;

  // For mobile banner, use slide-in/out animation
  if (mobileBanner) {
    return (
      <div
        className={`fixed top-0 left-0 w-full z-40 flex justify-center transition-transform duration-500 ${
          show ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ background: bgColor, color: textColor }}
      >
        <div className="signup-prompt p-2 rounded-b-lg shadow-md text-sm max-w-md w-full mx-auto flex items-center justify-between">
          <span>
            Sign up to Fund Flow to keep track of your donation and subscribe to
            your favorite campaign
          </span>
          <button
            className="ml-2 px-2 py-1  text-white rounded text-xs"
            style={{ background: accentColor, opacity: 0.8 }}
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }

  // Desktop/Sidebar version
  return (
    <div
      className="signup-prompt p-2 rounded mb-4 text-sm"
      style={{ background: bgColor, color: textColor }}
    >
      Sign up to Fund Flow to keep track of your donation and subscribe to your
      favorite campaign
      <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs">
        Sign up
      </button>
    </div>
  );
};

export default SignupPrompt;
