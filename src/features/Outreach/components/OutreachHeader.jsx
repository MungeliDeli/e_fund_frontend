import React from "react";
import { PrimaryButton } from "../../../components/Buttons";

const OutreachHeader = ({ title, onReachOut }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <h3 className="text-2xl font-semibold text-[color:var(--color-primary-text)] m-0">
          {title}
        </h3>
        <div className="flex justify-center sm:justify-start gap-3">
          <PrimaryButton onClick={onReachOut}>Reach Out</PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default OutreachHeader;
