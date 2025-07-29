import React, { useState } from "react";
import DonationFormSection from "./DonationFormSection";

const ResponsiveDonationModal = ({ config }) => {
  // This will be conditionally rendered on mobile only
  const [open, setOpen] = useState(false);

  // For now, just render nothing unless open is true
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <button
          className="absolute top-2 right-2 p-1"
          onClick={() => setOpen(false)}
        >
          <span className="text-xl">&times;</span>
        </button>
        <DonationFormSection config={config} isModal={true} />
      </div>
    </div>
  );
};

export default ResponsiveDonationModal;
