import React, { useState, useEffect } from "react";
import Table from "../../../components/Table";
import { IconButton } from "../../../components/Buttons";
import { FiEye, FiUserX, FiActivity, FiFlag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getOrganizerCampaignCounts } from "../services/usersApi";

function getInitials(name) {
  if (!name) return "";
  const words = name.split(" ");
  if (words.length === 1) return words[0][0]?.toUpperCase() || "";
  return (words[0][0] + words[1][0]).toUpperCase();
}

const columns = [
  {
    key: "organizationName",
    label: "Name",
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-[color:var(--color-primary-text)] leading-tight">
        {row.organizationName}
      </span>
    ),
  },
  {
    key: "organizationShortName",
    label: "Acronym",
    sortable: true,
  },
  {
    key: "status",
    label: "Verified",
    sortable: true,
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          row.status === "VERIFIED"
            ? "bg-[color:var(--color-primary)] text-white"
            : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
        }`}
        style={{ minWidth: 70, display: "inline-block", textAlign: "center" }}
      >
        {row.status === "VERIFIED" ? "Verified" : "Pending"}
      </span>
    ),
  },
  {
    key: "active",
    label: "Active",
    sortable: true,
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          row.active
            ? "bg-[color:var(--color-primary)] text-white"
            : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
        }`}
        style={{ minWidth: 70, display: "inline-block", textAlign: "center" }}
      >
        {row.active ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    render: (row) => <span className="font-mono text-xs">{row.email}</span>,
  },
  {
    key: "campaignCount",
    label: "Campaigns",
    sortable: true,
    render: (row) => (
      <span className="flex items-center gap-1 text-sm text-[color:var(--color-primary-text)]">
        <FiFlag className="w-3 h-3" />
        {row.campaignCount || 0}
      </span>
    ),
  },
];

function OrganizerTable({ data = [], onView, onDeactivate, filters = {} }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [campaignCounts, setCampaignCounts] = useState({});

  // Sorting state
  const [sort, setSort] = useState({ key: "", direction: "asc" });

  // Sort handler
  const handleSort = (key, direction) => setSort({ key, direction });

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.userType === "superAdmin";

  // Fetch campaign counts for all organizers
  useEffect(() => {
    const fetchCampaignCounts = async () => {
      if (!data || data.length === 0) return;

      console.log("Organizer data:", data); // Debug log

      try {
        const counts = await getOrganizerCampaignCounts();
        console.log("Final campaign counts:", counts); // Debug log
        setCampaignCounts(counts);
      } catch (error) {
        console.error("Failed to fetch campaign counts:", error);
        setCampaignCounts({});
      }
    };

    fetchCampaignCounts();
  }, [data]);

  // Handle organizer details modal
  const handleOrganizerDetails = (organizer) => {
    setSelectedOrganizer(organizer);
    setShowOrganizerModal(true);
  };

  // Handle profile view
  const handleProfileView = () => {
    if (selectedOrganizer) {
      navigate(`/organizers/${selectedOrganizer.userId}`);
      setShowOrganizerModal(false);
    }
  };

  // Handle deactivation with confirmation
  const handleDeactivateClick = () => {
    setConfirmAction("deactivate");
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirmAction = () => {
    if (selectedOrganizer) {
      if (confirmAction === "deactivate" && onDeactivate) {
        onDeactivate(selectedOrganizer.userId);
      }
    }
    setShowConfirmModal(false);
    setShowOrganizerModal(false);
    setSelectedOrganizer(null);
    setConfirmAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Normalize data for new states
  const normalizedData = (data || []).map((row) => ({
    ...row,
    status:
      row.status === true || row.status === "VERIFIED" ? "VERIFIED" : "PENDING",
    active: !!row.active,
    campaignCount: campaignCounts[row.userId] || 0,
  }));

  // Apply filters
  let processedData = normalizedData;
  if (filters.verified !== undefined) {
    processedData = processedData.filter(
      (row) => row.status === (filters.verified ? "VERIFIED" : "PENDING")
    );
  }
  if (filters.active !== undefined) {
    processedData = processedData.filter(
      (row) =>
        row.active === (filters.active === true || filters.active === "true")
    );
  }

  // Apply sorting
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

  return (
    <>
      <Table
        columns={columns}
        data={processedData}
        onSort={handleSort}
        sort={sort}
        scrollable={true}
        rowAction={(row) => (
          <IconButton
            onClick={() => handleOrganizerDetails(row)}
            className="p-2 text-[color:var(--color-primary)] transition-colors"
            title="View Organizer Details"
          >
            <FiEye className="w-4 h-4" />
          </IconButton>
        )}
      />

      {/* Organizer Details Modal */}
      {showOrganizerModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] rounded-lg p-6 max-w-md w-full mx-4 border border-[color:var(--color-muted)]">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
              Organizer Details
            </h3>

            {/* Organizer Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                {selectedOrganizer.profilePictureUrl ? (
                  <img
                    src={selectedOrganizer.profilePictureUrl}
                    alt={`${selectedOrganizer.organizationName} logo`}
                    className="w-12 h-12 object-cover rounded-full bg-white border border-[color:var(--color-muted)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold">
                    {getInitials(selectedOrganizer.organizationName)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-[color:var(--color-primary-text)]">
                    {selectedOrganizer.organizationName}
                  </h4>
                  <p className="text-sm text-[color:var(--color-secondary-text)]">
                    {selectedOrganizer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedOrganizer.active
                        ? "bg-[color:var(--color-primary)] text-white"
                        : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
                    }`}
                  >
                    {selectedOrganizer.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Verified:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedOrganizer.status === "VERIFIED"
                        ? "bg-[color:var(--color-primary)] text-white"
                        : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
                    }`}
                  >
                    {selectedOrganizer.status === "VERIFIED"
                      ? "Verified"
                      : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Acronym:
                  </span>
                  <span className="text-[color:var(--color-primary-text)]">
                    {selectedOrganizer.organizationShortName || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleProfileView}
                className="w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded hover:bg-[color:var(--color-accent)] transition-colors flex items-center justify-center gap-2"
              >
                <FiEye className="w-4 h-4" />
                View Profile
              </button>

              {isSuperAdmin && (
                <button
                  onClick={handleDeactivateClick}
                  className={`w-full px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                    selectedOrganizer.active
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-accent)]"
                  }`}
                >
                  <FiUserX className="w-4 h-4" />
                  {selectedOrganizer.active
                    ? "Deactivate Organizer"
                    : "Activate Organizer"}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowOrganizerModal(false)}
              className="w-full mt-4 px-4 py-2 border border-[color:var(--color-muted)] rounded text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] rounded-lg p-6 max-w-md w-full mx-4 border border-[color:var(--color-muted)]">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
              {selectedOrganizer.active
                ? "Deactivate Organizer"
                : "Activate Organizer"}
            </h3>
            <p className="text-[color:var(--color-secondary-text)] mb-6">
              {selectedOrganizer.active
                ? `Are you sure you want to deactivate ${selectedOrganizer.organizationName}? They will no longer be able to access their organizer account.`
                : `Are you sure you want to activate ${selectedOrganizer.organizationName}? They will regain access to their organizer account.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 border border-[color:var(--color-muted)] rounded text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded text-white transition-colors ${
                  selectedOrganizer.active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)]"
                }`}
              >
                {selectedOrganizer.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrganizerTable;
