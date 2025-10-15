import React from "react";
import SearchableDropdown from "./SearchableDropdown";
import { FiX } from "react-icons/fi";
import { PrimaryButton, SecondaryButton } from "./Buttons";

/**
 * Filter Modal Component
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to close the modal
 * @param {Object} filters - Current filter values
 * @param {Function} onFiltersChange - Function to update filters
 * @param {Array} filterOptions - Array of filter options with { key, label, options }
 */
function FilterModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  filterOptions,
  customFilters = [],
}) {
  if (!isOpen) return null;

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    if (value === "all") {
      delete newFilters[key];
    } else {
      newFilters[key] =
        value === "true" ? true : value === "false" ? false : value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[color:var(--color-background)] p-4 rounded-lg border border-[color:var(--color-muted)] shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-muted)]">
          <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
            Filter Options
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[color:var(--color-muted)] rounded transition-colors"
          >
            <FiX className="text-xl text-[color:var(--color-primary-text)]" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-4">
          {filterOptions.map((option) => (
            <div key={option.key}>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                {option.label}
              </label>
              {option.type === "searchable" ? (
                <SearchableDropdown
                  options={option.options || []}
                  value={filters[option.key] || ""}
                  onChange={(val) =>
                    handleFilterChange(option.key, val || "all")
                  }
                  placeholder={`Search ${option.label.toLowerCase()}...`}
                  className="w-full"
                />
              ) : (
                <select
                  value={
                    filters[option.key] !== undefined
                      ? filters[option.key].toString()
                      : "all"
                  }
                  onChange={(e) =>
                    handleFilterChange(option.key, e.target.value)
                  }
                  className="w-full px-3 py-2  rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent"
                >
                  <option value="all">All</option>
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Custom Filters */}
          {customFilters.map((customFilter) => (
            <div key={customFilter.key}>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                {customFilter.label}
              </label>
              {customFilter.component}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 ">
          <SecondaryButton onClick={clearAllFilters}>Clear All</SecondaryButton>
          <PrimaryButton onClick={onClose}>Apply</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
