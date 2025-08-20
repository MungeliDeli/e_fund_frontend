import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import airtelLogo from "../../../assets/airtel_logo.png";
import mtnLogo from "../../../assets/mtn_logo.png";

function PaymentModal({
  isOpen,
  onClose,
  amount,
  themeColor,
  formatAmount,
  onDonate,
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("airtel");
  const [phoneNumber, setPhoneNumber] = useState("978882033");
  const [donateAnonymously, setDonateAnonymously] = useState(false);
  const [subscribeToCampaign, setSubscribeToCampaign] = useState(true);

  if (!isOpen) return null;

  const handleDonate = () => {
    if (!phoneNumber.trim()) {
      alert("Please enter a valid phone number");
      return;
    }

    onDonate({
      amount,
      paymentMethod: selectedPaymentMethod,
      phoneNumber,
      donateAnonymously,
      subscribeToCampaign,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 "
        style={{ backgroundColor: "rgba(0, 0, 0, 0.68)" }}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b mx-2"
          style={{ borderColor: themeColor }}
        >
          <h2 className="text-xl font-semibold" style={{ color: themeColor }}>
            Payment Method
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[color:var(--color-muted)] rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-[color:var(--color-secondary-text)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 hide-scrollbar">
          {/* Payment Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[color:var(--color-primary-text)]">
              Select Payment Method:
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Airtel Money */}
              <button
                onClick={() => setSelectedPaymentMethod("airtel")}
                className={`p-4 rounded-lg transition-all ${
                  selectedPaymentMethod === "airtel"
                    ? "border-1 border-[color:var(--color-primary)] shadow-md"
                    : "border border-transparent shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={airtelLogo}
                    alt="Airtel Money"
                    className="h-8 w-auto"
                  />
                  <span className="text-xs text-[color:var(--color-secondary-text)]">
                    airtel money
                  </span>
                </div>
              </button>

              {/* MTN Mobile Money */}
              <button
                onClick={() => setSelectedPaymentMethod("mtn")}
                className={`p-4 rounded-lg transition-all ${
                  selectedPaymentMethod === "mtn"
                    ? "border-1 border-[color:var(--color-primary)] shadow-md"
                    : "border border-transparent shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={mtnLogo}
                    alt="MTN Mobile Money"
                    className="h-8 w-auto"
                  />
                  <span className="text-xs text-[color:var(--color-secondary-text)]">
                    MTN Mobile Money
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Donation Summary */}
          <div className="space-y-2 p-4 bg-[color:var(--color-background)] rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[color:var(--color-primary-text)]">
                You are donating:
              </span>
              <span
                className="text-lg font-semibold"
                style={{ color: themeColor }}
              >
                {formatAmount(amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[color:var(--color-primary-text)]">
                Payment Option:
              </span>
              <span
                className="text-sm font-medium px-2 py-1 rounded"
                style={{
                  color:
                    selectedPaymentMethod === "airtel" ? "#FF0000" : "#FFCC08",
                }}
              >
                {selectedPaymentMethod === "airtel"
                  ? "Airtel Money"
                  : "MTN Mobile Money"}
              </span>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-primary-text)]">
              Phone Number:
            </label>
            <div className="flex">
              <select className="px-3 py-3 border border-[color:var(--color-muted)] border-r-0 rounded-l-lg bg-white text-[color:var(--color-primary-text)] focus:outline-none">
                <option>+260</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-3 border border-[color:var(--color-muted)] rounded-r-lg bg-white text-[color:var(--color-primary-text)] focus:outline-none focus:border-[color:var(--color-primary)]"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-[color:var(--color-background)] rounded-lg">
            <p className="text-xs text-[color:var(--color-secondary-text)] leading-relaxed">
              An approval request will be sent to your phone. Enter your Mobile
              Money pin to approve the transaction.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={donateAnonymously}
                onChange={(e) => setDonateAnonymously(e.target.checked)}
                className="w-4 h-4 rounded border-[color:var(--color-muted)] focus:ring-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)] checked:border-[color:var(--color-primary)]"
                style={{
                  accentColor: themeColor,
                }}
              />
              <span className="text-sm text-[color:var(--color-primary-text)]">
                Donate Anonymously
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={subscribeToCampaign}
                onChange={(e) => setSubscribeToCampaign(e.target.checked)}
                className="w-4 h-4 rounded border-[color:var(--color-muted)] focus:ring-[color:var(--color-primary)] checked:bg-[color:var(--color-primary)] checked:border-[color:var(--color-primary)]"
                style={{
                  accentColor: themeColor,
                }}
              />
              <span className="text-sm text-[color:var(--color-primary-text)]">
                Subscribe to this campaign
              </span>
            </label>
          </div>

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            Donate
          </button>

          {/* Legal Disclaimer */}
          <p className="text-xs text-[color:var(--color-secondary-text)] text-center leading-relaxed">
            By clicking 'Donate now', you agree to FundFlow's{" "}
            <a
              href="#"
              className="underline hover:text-[color:var(--color-primary)]"
              style={{ color: themeColor }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline hover:text-[color:var(--color-primary)]"
              style={{ color: themeColor }}
            >
              Privacy Notice
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
