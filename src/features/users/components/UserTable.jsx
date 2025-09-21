import React, { useState } from "react";
import Table from "../../../components/Table";
import { IconButton } from "../../../components/Buttons";
import { FiEye, FiUser, FiUserX, FiShield } from "react-icons/fi";
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
    key: "gender",
    label: "Gender",
    sortable: true,
    render: (row) => (
      <span className="capitalize text-[color:var(--color-primary-text)]">
        {row.gender || "Not specified"}
      </span>
    ),
  },
  {
    key: "country",
    label: "Country",
    sortable: true,
    render: (row) => (
      <span className="text-[color:var(--color-primary-text)]">
        {row.country || "Not specified"}
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
    label: "Active",
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
    key: "createdAt",
    label: "Joined",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-[color:var(--color-secondary-text)]">
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
      </span>
    ),
  },
];

function UserTable({
  data = [],
  onView,
  onDeactivate,
  onMakeAdmin,
  filters = {},
}) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Sorting state
  const [sort, setSort] = useState({ key: "", direction: "asc" });

  // Sort handler
  const handleSort = (key, direction) => setSort({ key, direction });

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.userType === "superAdmin";

  // Handle user details modal
  const handleUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Handle profile view
  const handleProfileView = () => {
    if (selectedUser) {
      navigate(`/users/${selectedUser.userId}`);
      setShowUserModal(false);
    }
  };

  // Handle deactivation with confirmation
  const handleDeactivateClick = () => {
    setConfirmAction("deactivate");
    setShowConfirmModal(true);
  };

  // Handle make admin with confirmation
  const handleMakeAdminClick = () => {
    setConfirmAction("makeAdmin");
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirmAction = () => {
    if (selectedUser) {
      if (confirmAction === "deactivate" && onDeactivate) {
        onDeactivate(selectedUser.userId);
      } else if (confirmAction === "makeAdmin" && onMakeAdmin) {
        onMakeAdmin(selectedUser.userId);
      }
    }
    setShowConfirmModal(false);
    setShowUserModal(false);
    setSelectedUser(null);
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
            onClick={() => handleUserDetails(row)}
            className="p-2 text-[color:var(--color-primary)] transition-colors"
            title="View User Details"
          >
            <FiEye className="w-4 h-4" />
          </IconButton>
        )}
      />

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] rounded-lg p-6 max-w-md w-full mx-4 border border-[color:var(--color-muted)]">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
              User Details
            </h3>

            {/* User Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                {selectedUser.profilePictureUrl ? (
                  <img
                    src={selectedUser.profilePictureUrl}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName} avatar`}
                    className="w-12 h-12 object-cover rounded-full bg-white border border-[color:var(--color-muted)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[color:var(--color-muted)] flex items-center justify-center text-lg text-[color:var(--color-secondary-text)] font-bold">
                    {getInitials(
                      `${selectedUser.firstName} ${selectedUser.lastName}`
                    )}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-[color:var(--color-primary-text)]">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-sm text-[color:var(--color-secondary-text)]">
                    {selectedUser.email}
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
                      selectedUser.isActive
                        ? "bg-[color:var(--color-primary)] text-white"
                        : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
                    }`}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Email Verified:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedUser.isEmailVerified
                        ? "bg-[color:var(--color-primary)] text-white"
                        : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)]"
                    }`}
                  >
                    {selectedUser.isEmailVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-secondary-text)]">
                    Joined:
                  </span>
                  <span className="text-[color:var(--color-primary-text)]">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString()
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
                      selectedUser.isActive
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-accent)]"
                    }`}
                  >
                    <FiUserX className="w-4 h-4" />
                    {selectedUser.isActive
                      ? "Deactivate User"
                      : "Activate User"}
                  </button>

                  <button
                    onClick={handleMakeAdminClick}
                    className="w-full px-4 py-2 bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)] rounded hover:bg-[color:var(--color-primary)] hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShield className="w-4 h-4" />
                    Make Admin
                  </button>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowUserModal(false)}
              className="w-full mt-4 px-4 py-2 border border-[color:var(--color-muted)] rounded text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] rounded-lg p-6 max-w-md w-full mx-4 border border-[color:var(--color-muted)]">
            <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
              {confirmAction === "deactivate"
                ? selectedUser.isActive
                  ? "Deactivate User"
                  : "Activate User"
                : "Make Admin"}
            </h3>
            <p className="text-[color:var(--color-secondary-text)] mb-6">
              {confirmAction === "deactivate"
                ? selectedUser.isActive
                  ? `Are you sure you want to deactivate ${selectedUser.firstName} ${selectedUser.lastName}? They will no longer be able to access their account.`
                  : `Are you sure you want to activate ${selectedUser.firstName} ${selectedUser.lastName}? They will regain access to their account.`
                : `Are you sure you want to make ${selectedUser.firstName} ${selectedUser.lastName} an admin? This will give them administrative privileges.`}
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
                    ? selectedUser.isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)]"
                    : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)]"
                }`}
              >
                {confirmAction === "deactivate"
                  ? selectedUser.isActive
                    ? "Deactivate"
                    : "Activate"
                  : "Make Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserTable;
