import React, { useEffect, useState } from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";

function ThankYouModal({
  isOpen,
  onClose,
  donationDetails,
  themeColor,
  formatAmount,
}) {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.68)" }}
      />

      {/* Modal */}
      <div className="relative bg-[color:var(--color-background)] rounded-xl w-full max-w-md shadow-[0_2px_16px_0_var(--color-shadow)]">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b mx-2"
          style={{ borderColor: themeColor }}
        >
          <h2 className="text-xl font-semibold" style={{ color: themeColor }}>
            Thank You!
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[color:var(--color-muted)] rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-[color:var(--color-secondary-text)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <FiCheckCircle
                className="w-20 h-20 animate-pulse"
                style={{ color: themeColor }}
              />
              <div
                className="absolute inset-0 w-20 h-20 rounded-full animate-ping"
                style={{ backgroundColor: themeColor, opacity: 0.3 }}
              ></div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
              Donation Successful!
            </h3>
            <p className="text-sm text-[color:var(--color-secondary-text)]">
              Your generous contribution has been received and will make a
              difference.
            </p>
          </div>

          {/* Donation Details */}
          {donationDetails && (
            <div className="space-y-3 p-4 bg-[color:var(--color-surface)] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[color:var(--color-primary-text)]">
                  Amount Donated:
                </span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: themeColor }}
                >
                  {formatAmount
                    ? formatAmount(donationDetails.amount)
                    : `$${donationDetails.amount}`}
                </span>
              </div>

              {donationDetails.paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[color:var(--color-primary-text)]">
                    Payment Method:
                  </span>
                  <span className="text-sm font-medium px-2 py-1 rounded bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)]">
                    {donationDetails.paymentMethod === "airtel"
                      ? "Airtel Money"
                      : "MTN Mobile Money"}
                  </span>
                </div>
              )}

              {donationDetails.message && (
                <div className="space-y-1">
                  <span className="text-sm text-[color:var(--color-primary-text)]">
                    Your Message:
                  </span>
                  <p className="text-sm text-[color:var(--color-secondary-text)] bg-[color:var(--color-background)] p-2 rounded border border-[color:var(--color-muted)]">
                    "{donationDetails.message}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Auto-close Timer */}
          <div className="text-center">
            <p className="text-xs text-[color:var(--color-secondary-text)]">
              This modal will close automatically in{" "}
              <span className="font-semibold" style={{ color: themeColor }}>
                {timeLeft}
              </span>{" "}
              seconds
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThankYouModal;
