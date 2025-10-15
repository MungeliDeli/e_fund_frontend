import React, { useState } from "react";
import Table from "../../../components/Table";
import { IconButton } from "../../../components/Buttons";
import { FiEye, FiShield, FiUserX, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

function getInitials(name) {
  if (!name) return "";
  const words = name.split(" ");
  if (words.length === 1) return words[0][0]?.toUpperCase() || "";
  return (words[0][0] + words[1][0]).toUpperCase();
}

const columns = [
  {
    key: "firstName",
    label: "Name",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-semibold text-[color:var(--color-primary-text)] leading-tight">
          {row.firstName} {row.lastName}
        </span>
        <span className="text-xs text-[color:var(--color-secondary-text)]">
          {row.email}
        </span>
      </div>
    ),
  },
  {
    key: "userType",
    label: "Role",
    sortable: true,
    render: (row) => (
      <span className="capitalize text-[color:var(--color-primary-text)] font-medium">
        {row.userType?.replace(/([A-Z])/g, " $1").trim() || "Admin"}
      </span>
    ),
  },
  {
    key: "isEmailVerified",
    label: "Email Verified",
    sortable: true,
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          row.isEmailVerified
            ? "bg-[color:var(--color-primary)] text-white"
            : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
        }`}
        style={{ minWidth: 70, display: "inline-block", textAlign: "center" }}
      >
        {row.isEmailVerified ? "Verified" : "Pending"}
      </span>
    ),
  },
  {
    key: "isActive",
    label: "Status",
    sortable: true,
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          row.isActive
            ? "bg-[color:var(--color-primary)] text-white"
            : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
        }`}
        style={{ minWidth: 70, display: "inline-block", textAlign: "center" }}
      >
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "adminSince",
    label: "Admin Since",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-[color:var(--color-secondary-text)]">
        {row.adminSince ? new Date(row.adminSince).toLocaleDateString() : "N/A"}
      </span>
    ),
  },
];

function AdminTable({
  data = [],
  onView,
  onDeactivate,
  onRemoveAdmin,
  filters = {},
}) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Sorting state
  const [sort, setSort] = useState({ key: "", direction: "asc" });

  // Sort handler
  const handleSort = (key, direction) => setSort({ key, direction });

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.userType === "superAdmin";

  // Handle admin details modal
  const handleAdminDetails = (admin) => {
    setSelectedAdmin(admin);
    setShowAdminModal(true);
  };

  // Handle profile view
  const handleProfileView = () => {
    if (selectedAdmin) {
      navigate(`/users/${selectedAdmin.userId}`);
      setShowAdminModal(false);
    }
  };

  // Handle deactivation with confirmation
  const handleDeactivateClick = () => {
    setConfirmAction("deactivate");
    setShowConfirmModal(true);
  };

  // Handle remove admin with confirmation
  const handleRemoveAdminClick = () => {
    setConfirmAction("removeAdmin");
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirmAction = () => {
    if (selectedAdmin) {
      if (confirmAction === "deactivate" && onDeactivate) {
        onDeactivate(selectedAdmin.userId);
      } else if (confirmAction === "removeAdmin" && onRemoveAdmin) {
        onRemoveAdmin(selectedAdmin.userId);
      }
    }
    setShowConfirmModal(false);
    setShowAdminModal(false);
    setSelectedAdmin(null);
    setConfirmAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Normalize data for new states
  const normalizedData = (data || []).map((row) => ({
    ...row,
    isEmailVerified: !!row.isEmailVerified,
    isActive: !!row.isActive,
  }));

  // Apply filters
  let processedData = normalizedData;
  if (filters.emailVerified !== undefined) {
    processedData = processedData.filter(
      (row) =>
        row.isEmailVerified ===
        (filters.emailVerified === true || filters.emailVerified === "true")
    );
  }
  if (filters.active !== undefined) {
    processedData = processedData.filter(
      (row) =>
        row.isActive === (filters.active === true || filters.active === "true")
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
            onClick={() => handleAdminDetails(row)}
            className="p-2 text-[color:var(--color-primary)] transition-colors"
            title="View Admin Details"
          >
            <FiEye className="w-4 h-4" />
          </IconButton>
        )}
      />

      {/* Admin Details Modal */}
      {showAdminModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] rounded-lg p-6 max-w-md w-full mx-4 border border-[color:var(--color-muted)]">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
              Admin Details
            </h3>

            {/* Admin Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                {selectedAdmin.profilePictureUrl ? (
                  <img
                    src={selectedAdmin.profilePictureUrl}
                    alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName} avatar`}
                    className="w-12 h-12 object-cover rounded-full bg-white border border-[color:var(--color-muted)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold">
                    {getInitials(
                      `${selectedAdmin.firstName} ${selectedAdmin.lastName}`
                    )}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-[color:var(--color-primary-text)]">
                    {selectedAdmin.firstName} {selectedAdmin.lastName}
                  </h4>
                  <p className="text-sm text-[color:var(--color-secondary-text)]">
                    {selectedAdmin.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Role:
                  </span>
                  <span className="capitalize text-[color:var(--color-primary-text)] font-medium">
                    {selectedAdmin.userType
                      ?.replace(/([A-Z])/g, " $1")
                      .trim() || "Admin"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedAdmin.isActive
                        ? "bg-[color:var(--color-primary)] text-white"
                        : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
                    }`}
                  >
                    {selectedAdmin.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Email Verified:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedAdmin.isEmailVerified
                        ? "bg-[color:var(--color-primary)] text-white"
                        : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
                    }`}
                  >
                    {selectedAdmin.isEmailVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Admin Since:
                  </span>
                  <span className="text-[color:var(--color-primary-text)]">
                    {selectedAdmin.adminSince
                      ? new Date(selectedAdmin.adminSince).toLocaleDateString()
                      : "N/A"}
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
                <>
                  <button
                    onClick={handleDeactivateClick}
                    className={`w-full px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                      selectedAdmin.isActive
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-accent)]"
                    }`}
                  >
                    <FiUserX className="w-4 h-4" />
                    {selectedAdmin.isActive
                      ? "Deactivate Admin"
                      : "Activate Admin"}
                  </button>

                  <button
                    onClick={handleRemoveAdminClick}
                    className="w-full px-4 py-2 bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)] rounded hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <FiUser className="w-4 h-4" />
                    Remove Admin
                  </button>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowAdminModal(false)}
              className="w-full mt-4 px-4 py-2 border border-[color:var(--color-muted)] rounded text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] rounded-lg p-6 max-w-md w-full mx-4 border border-[color:var(--color-muted)]">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
              {confirmAction === "deactivate"
                ? selectedAdmin.isActive
                  ? "Deactivate Admin"
                  : "Activate Admin"
                : "Remove Admin"}
            </h3>
            <p className="text-[color:var(--color-secondary-text)] mb-6">
              {confirmAction === "deactivate"
                ? selectedAdmin.isActive
                  ? `Are you sure you want to deactivate ${selectedAdmin.firstName} ${selectedAdmin.lastName}? They will no longer be able to access their admin account.`
                  : `Are you sure you want to activate ${selectedAdmin.firstName} ${selectedAdmin.lastName}? They will regain access to their admin account.`
                : `Are you sure you want to remove ${selectedAdmin.firstName} ${selectedAdmin.lastName} from admin privileges? They will become a regular user.`}
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
                  confirmAction === "deactivate"
                    ? selectedAdmin.isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmAction === "deactivate"
                  ? selectedAdmin.isActive
                    ? "Deactivate"
                    : "Activate"
                  : "Remove Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminTable;
