/**
 * SectionCard Component
 * 
 * A reusable card component that provides consistent styling and layout
 * for different sections of the user profile. This component creates a
 * standardized container with optional edit functionality.
 * 
 * Key Features:
 * - Consistent card styling across all profile sections
 * - Optional edit button for owner-only sections
 * - Responsive design with proper spacing
 * - Theme-aware styling using CSS variables
 * 
 * Props:
 * @param {string} title - Section title displayed in the header
 * @param {boolean} isOwner - Whether the current user owns this profile
 * @param {boolean} editable - Whether this section can be edited
 * @param {Function} onEdit - Callback when edit button is clicked
 * @param {ReactNode} children - Content to display in the card body
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

import { FiEdit3 } from "react-icons/fi";

function SectionCard({ title, isOwner, editable, onEdit, children }) {
  return (
    <div className="bg-[color:var(--color-background)] rounded-lg border border-[color:var(--color-muted)] p-6">
      {/* Card Header with Title and Edit Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-text)]">
          {title}
        </h3>
        {/* Show edit button only for owners when section is editable */}
        {isOwner && editable && onEdit && (
          <button
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-[color:var(--color-muted)] transition-colors"
            aria-label={`Edit ${title.toLowerCase()}`}
          >
            <FiEdit3 className="text-[color:var(--color-primary)]" />
          </button>
        )}
      </div>
      <hr className="my-2 border-[color:var(--color-muted)]" />
      {/* Card Content */}
      <div className="text-[color:var(--color-text)]">
        {children}
      </div>
    </div>
  );
}

export default SectionCard; 