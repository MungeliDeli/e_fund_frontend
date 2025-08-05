import React, { useState } from "react";
import Table from "../../../components/Table";
import { IconButton } from "../../../components/Buttons";
import { FiEye, FiImage, FiEdit2, FiCalendar } from "react-icons/fi";
import {
  getStatusColor,
  getStatusDisplay,
} from "../../campaigns/utils/campaignStatusConfig";

function getInitials(name) {
  if (!name) return "";
  const words = name.split(" ");
  if (words.length === 1) return words[0][0]?.toUpperCase() || "";
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "Not set";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return "Invalid date";
  }
}

// Base columns that are common to both views
const baseColumns = [
  {
    key: "logoImageUrl",
    label: "Logo",
    render: (row) => {
      const [imgError, setImgError] = React.useState(false);
      return row.logoImageUrl && !imgError ? (
        <img
          src={row.logoImageUrl}
          alt={row.title + " logo"}
          className="w-10 h-10 object-contain rounded bg-white border border-[color:var(--color-muted)]"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold">
          {row.title ? getInitials(row.title) : <FiImage />}
        </div>
      );
    },
    sortable: false,
  },
  {
    key: "title",
    label: "Title",
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-[color:var(--color-primary-text)] leading-tight">
        {row.title}
      </span>
    ),
  },
  {
    key: "categoryName",
    label: "Category",
    sortable: true,
    render: (row) => {
      if (Array.isArray(row.categories) && row.categories.length > 0) {
        return (
          <div className="flex flex-wrap gap-1 max-w-[120px]">
            {row.categories.map((cat) => (
              <span
                key={cat.categoryId || cat.name}
                className="inline-block  text-[color:var(--color-primary-text)] rounded px-2 py-0.5 text-xs font-medium"
              >
                {cat.name}
              </span>
            ))}
          </div>
        );
      }
      // fallback to old single category name
      return row.categoryName || "No category";
    },
  },
  {
    key: "currentRaisedAmount",
    label: "Raised",
    sortable: true,
    render: (row) => (
      <span className="font-mono text-xs">
        ${row.currentRaisedAmount?.toLocaleString() || "0.00"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => {
      const status = (row.status || "").toLowerCase();
      const color = getStatusColor(status);
      const display = getStatusDisplay(status);

      return (
        <span
          className="px-2 py-1 rounded text-xs font-bold"
          style={{
            minWidth: 70,
            display: "inline-block",
            textAlign: "center",
            backgroundColor: color + "22", // 22 = 13% opacity
            color: color,
            border: `1px solid ${color}33`, // 33 = 20% opacity for border
          }}
        >
          {display}
        </span>
      );
    },
  },
];

// Organizer-specific columns (includes end date, excludes organizer name)
const organizerColumns = [
  ...baseColumns.slice(0, 2), // Logo and Title
  {
    key: "endDate",
    label: "End Date",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-1">
        <FiCalendar className="w-3 h-3 text-[color:var(--color-muted-text)]" />
        <span className="text-xs text-[color:var(--color-primary-text)]">
          {formatDate(row.endDate)}
        </span>
      </div>
    ),
  },
  ...baseColumns.slice(2), // Category, Raised, Status
];

// Admin-specific columns (includes organizer name, excludes end date)
const adminColumns = [
  ...baseColumns.slice(0, 2), // Logo and Title
  {
    key: "organizerName",
    label: "Organizer",
    sortable: true,
  },
  ...baseColumns.slice(2), // Category, Raised, Status
];

function CampaignTable({
  data = [],
  onView,
  onEdit,
  filters = {},
  showEditButton = false,
  viewMode = "organizer", // "organizer" or "admin"
}) {
  const [sort, setSort] = useState({ key: "", direction: "asc" });

  // Sort handler
  const handleSort = (key, direction) => setSort({ key, direction });

  // Normalize data (future: add more normalization if needed)
  const normalizedData = data || [];

  // Apply sorting
  let processedData = normalizedData;
  if (sort.key) {
    processedData = [...processedData].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Select columns based on view mode
  const columns = viewMode === "admin" ? adminColumns : organizerColumns;

  return (
    <Table
      columns={columns}
      data={processedData}
      onSort={handleSort}
      sort={sort}
      scrollable={true}
      rowAction={(row) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => onView?.(row.campaignId)}
            className="px-4 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white transition-colors"
          >
            View
          </IconButton>
          {showEditButton && onEdit && (
            <IconButton
              onClick={() => onEdit?.(row.campaignId)}
              className="px-4 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-primary-text)] transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      )}
    />
  );
}

export default CampaignTable;
