import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PrimaryButton, SecondaryButton } from "./Buttons";

function GuestAuthPrompt({ themeColor, className = "" }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return null;

  return (
    <div
      className={`rounded-lg p-4 text-center border ${className}`}
      style={{
        backgroundColor: `${themeColor}15`,
        borderColor: `${themeColor}40`,
      }}
    >
      <p className="text-sm text-[color:var(--color-secondary-text)] mb-3">
        Have an account? Log in to track your donations and get updates. New
        here? Create an account in seconds.
      </p>
      <div className="flex gap-2">
        <SecondaryButton
          onClick={() => navigate("/login")}
          className="flex-1"
          style={{
            borderColor: `${themeColor}60`,
            color: themeColor,
            backgroundColor: "transparent",
          }}
        >
          Log In
        </SecondaryButton>
        <PrimaryButton
          onClick={() => navigate("/signup")}
          className="flex-1"
          style={{ backgroundColor: themeColor }}
        >
          Sign Up
        </PrimaryButton>
      </div>
    </div>
  );
}

export default GuestAuthPrompt;
