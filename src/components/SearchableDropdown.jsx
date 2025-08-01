import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiX, FiSearch } from "react-icons/fi";

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = Array.isArray(options)
    ? options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set selected option when value changes
  useEffect(() => {
    if (value) {
      const option = options.find((opt) => opt.categoryId === value);
      setSelectedOption(option);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option.categoryId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedOption(null);
    onChange("");
    setSearchTerm("");
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div
          className={`flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer transition-colors ${
            disabled
              ? "bg-[color:var(--color-muted)] cursor-not-allowed"
              : "bg-[color:var(--color-background)] hover:border-[color:var(--color-primary)]"
          } ${error ? "border-red-500" : "border-[color:var(--color-muted)]"} ${
            isOpen
              ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)] ring-opacity-20"
              : ""
          }`}
          onClick={handleInputClick}
        >
          {selectedOption ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[color:var(--color-primary-text)]">
                {selectedOption.name}
              </span>
              <button
                onClick={handleRemove}
                className="p-1 text-[color:var(--color-secondary-text)] hover:text-red-500 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <FiSearch className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                className="flex-1 bg-transparent outline-none text-[color:var(--color-primary-text)] placeholder-[color:var(--color-secondary-text)]"
                disabled={disabled}
              />
            </div>
          )}
          <FiChevronDown
            className={`w-4 h-4 text-[color:var(--color-secondary-text)] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-[color:var(--color-secondary-text)] text-sm">
              No categories found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.categoryId}
                className={`px-3 py-2 cursor-pointer hover:bg-[color:var(--color-surface)] transition-colors ${
                  selectedOption?.categoryId === option.categoryId
                    ? "bg-[color:var(--color-primary)] text-white"
                    : "text-[color:var(--color-primary-text)]"
                }`}
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </div>
            ))
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;
