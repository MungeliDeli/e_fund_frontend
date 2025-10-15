import React from "react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

function PaymentResultModal({
  isOpen,
  onClose,
  themeColor = "#10B981",
  providerLabel = "your selected provider",
  isProcessing = false,
  errorMessage = null,
  title = "Payment Result",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.68)" }}
      />

      {/* Modal */}
      <div className="relative bg-[color:var(--color-background)] rounded-xl w-full max-w-md shadow-[0_2px_16px_0_var(--color-shadow)] max-h-[95vh] flex flex-col">
        <div
          className="flex items-center justify-between p-4 border-b mx-2"
          style={{ borderColor: themeColor }}
        >
          <h2 className="text-xl font-semibold" style={{ color: themeColor }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-1 hover:bg-[color:var(--color-muted)] rounded-lg transition-colors text-[color:var(--color-secondary-text)]"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {!errorMessage && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-block w-6 h-6 border-2 border-[color:var(--color-primary-text)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[color:var(--color-primary-text)] font-medium">
                  Processing your payment...
                </span>
              </div>
              <p className="text-sm text-[color:var(--color-secondary-text)] leading-relaxed">
                Your deposit is being processed. A confirmation pop-up should be
                sent to you by {providerLabel} for your transaction to be
                confirmed. Please approve the prompt on your device.
              </p>
            </div>
          )}

          {!!errorMessage && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <FiAlertTriangle className="w-5 h-5" />
                <span className="font-medium">Payment failed</span>
              </div>
              <p className="text-sm text-[color:var(--color-secondary-text)]">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        <div
          className="p-4 border-t mx-2 flex justify-end"
          style={{ borderColor: themeColor }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentResultModal;
