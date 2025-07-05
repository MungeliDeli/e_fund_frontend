import { FiSearch } from "react-icons/fi";

function SearchBar({ placeholder = "Search...", value, onChange, className = "" }) {
  return (
    <div className={`flex items-center w-full max-w-sm mx-auto bg-[color:var(--color-surface)] rounded-full px-3 py-1 shadow-sm ${className}`}>
      <FiSearch className="text-xl text-[color:var(--color-secondary-text)] mr-2 shrink-0" />
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-[color:var(--color-primary-text)] placeholder-[color:var(--color-secondary-text)] text-sm min-w-0"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SearchBar; 