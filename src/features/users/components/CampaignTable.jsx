import React, { useState, useEffect } from "react";
import Table from "../../../components/Table";
import { IconButton } from "../../../components/Buttons";
import { FiEye, FiImage, FiEdit2, FiCalendar, FiPlay } from "react-icons/fi";
import {
  getStatusColor,
  getStatusDisplay,
} from "../../campaigns/utils/campaignStatusConfig";
import StatusBadge from "../../../components/StatusBadge";
import { fetchOrganizerById } from "../services/usersApi";

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
    key: "mainMedia",
    label: "Media",
    render: (row) => {
      const [imgError, setImgError] = React.useState(false);
      const mainMedia = row.customPageSettings?.mainMedia;

      if (mainMedia && mainMedia.url && !imgError) {
        if (mainMedia.type === "image") {
          return (
            <img
              src={mainMedia.url}
              alt={row.name + " media"}
              className="w-10 h-10 object-cover rounded bg-white border border-[color:var(--color-muted)]"
              onError={() => setImgError(true)}
            />
          );
        } else if (mainMedia.type === "video") {
          return (
            <div className="w-10 h-10 rounded bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold relative">
              <FiPlay className="w-4 h-4" />
            </div>
          );
        }
      }

      // Fallback to logoImageUrl if mainMedia is not available
      if (row.logoImageUrl && !imgError) {
        return (
          <img
            src={row.logoImageUrl}
            alt={row.name + " logo"}
            className="w-10 h-10 object-contain rounded bg-white border border-[color:var(--color-muted)]"
            onError={() => setImgError(true)}
          />
        );
      }

      return (
        <div className="w-10 h-10 rounded bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold">
          {row.name ? getInitials(row.name) : <FiImage />}
        </div>
      );
    },
    sortable: false,
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-[color:var(--color-primary-text)] leading-tight">
        {row.name}
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
        K{row.currentRaisedAmount?.toLocaleString() || "0.00"}
      </span>
    ),
  },
  {
    key: "donationCount",
    label: "Donations",
    sortable: true,
    render: (row) => (
      <span className="font-mono text-xs">
        {typeof row.donationCount === "number"
          ? row.donationCount
          : parseInt(row.donationCount || 0, 10)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => {
      const statusKey = (row.status || "").toLowerCase();

      const display = getStatusDisplay(statusKey);
      return <StatusBadge status={row.status} label={display} />;
    },
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-[color:var(--color-secondary-text)]">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

// Organizer-specific columns (excludes end date)
const organizerColumns = [...baseColumns];

// Admin-specific columns (includes organizer name, excludes end date)
const adminColumns = [
  ...baseColumns.slice(0, 2), // Media and Name
  {
    key: "organizerName",
    label: "Organizer",
    sortable: true,
    render: (row) => {
      const [organizerName, setOrganizerName] = React.useState("Loading...");

      React.useEffect(() => {
        if (row.organizerId) {
          fetchOrganizerById(row.organizerId)
            .then((response) => {
              let name = "Unknown";

              // Access the data property from the response
              const organizer = response.data || response;

              console.log("Organizer:", organizer);

              name = organizer.organizationShortName;

              setOrganizerName(name);
            })
            .catch((error) => {
              console.error("Failed to fetch organizer:", error);
              setOrganizerName("Unknown");
            });
        } else {
          setOrganizerName("Unknown");
        }
      }, [row.organizerId]);

      return (
        <span className="text-sm text-[color:var(--color-primary-text)]">
          {organizerName}
        </span>
      );
    },
  },
  ...baseColumns.slice(2), // Category, Raised, Donations, Status, Created
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
