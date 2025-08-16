import React, { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

const DonationAmountsInput = ({ label, value = [], onChange }) => {
  const [newAmount, setNewAmount] = useState("");

  const handleAddAmount = () => {
    const amount = parseInt(newAmount);
    if (amount && amount > 0 && !value.includes(amount)) {
      const updatedAmounts = [...value, amount].sort((a, b) => b - a);
      onChange(updatedAmounts);
      setNewAmount("");
    }
  };

  const handleRemoveAmount = (index) => {
    const updatedAmounts = value.filter((_, i) => i !== index);
    onChange(updatedAmounts);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAmount();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-2">
        {label}
      </label>

      {/* Add new amount */}
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter amount"
          min="1"
          className="flex-1 px-3 py-2 bg-[color:var(--color-background)] border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
        />
        <button
          onClick={handleAddAmount}
          disabled={!newAmount || parseInt(newAmount) <= 0}
          className="px-3 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <FiPlus size={16} />
          Add
        </button>
      </div>

      {/* Display amounts */}
      <div className="space-y-2">
        {value.map((amount, index) => (
          <div
            key={`${amount}-${index}`}
            className="flex items-center gap-2 p-2 bg-[color:var(--color-surface)] rounded-md border border-[color:var(--color-border)]"
          >
            <button
              onClick={() => setNewAmount(amount.toString())}
              className="flex-1 text-left font-medium hover:text-[color:var(--color-primary)] transition-colors"
              title="Click to load into input field"
            >
              K{amount}.00
            </button>
            <button
              onClick={() => handleRemoveAmount(index)}
              className="p-1 text-[color:var(--color-secondary-text)] hover:text-red-500"
              title="Remove"
            >
              <FiX size={16} />
            </button>
          </div>
        ))}
      </div>

      {value.length === 0 && (
        <p className="text-sm text-[color:var(--color-secondary-text)] italic">
          No amounts added yet. Add some predefined donation amounts above.
        </p>
      )}
    </div>
  );
};

export default DonationAmountsInput;
