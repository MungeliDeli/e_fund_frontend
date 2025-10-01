import React, { useState, useEffect } from "react";
import { SecondaryButton } from "../../../../../../components/Buttons";
import {
  FiFilter,
  FiUsers,
  FiCheckCircle,
  FiUserX,
  FiActivity,
  FiUserMinus,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import SearchBar from "../../../../../../components/SearchBar/SearchBar";
import UserTable from "../../../../components/UserTable";
import FilterModal from "../../../../../../components/FilterModal";
import { useNotification } from "../../../../../../contexts/NotificationContext";
import {
  fetchUsers,
  fetchAllUsers,
  toggleUserStatus,
  makeUserAdmin,
} from "../../../../services/usersApi";
import {
  TotalStatsCard,
  PieStatsCard,
} from "../../../../../../components/StatsCards";

function UsersTab() {
  const { showSuccess, showError } = useNotification();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleView = (userId) => {
    // Action button does nothing for now as requested
    console.log("View user:", userId);
  };

  const handleDeactivate = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Find the user to get current status
      const user = users.find((u) => u.userId === userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Toggle the user's active status
      const newStatus = !user.isActive;
      await toggleUserStatus(userId, newStatus);

      // Refresh the data after successful toggle
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };
      const updatedUsers = await fetchUsers(searchFilters);
      setUsers(updatedUsers);

      // Also update allUsers for stats
      const updatedAllUsers = await fetchAllUsers();
      setAllUsers(updatedAllUsers);

      showSuccess(
        `User ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      setError(error.message || "Failed to toggle user status");
      showError(error.message || "Failed to toggle user status");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId, adminRole = "supportAdmin") => {
    try {
      setLoading(true);
      setError(null);

      // Make user admin with selected role
      await makeUserAdmin(userId, adminRole);

      // After successful admin promotion, refresh the data
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };
      const updatedUsers = await fetchUsers(searchFilters);
      setUsers(updatedUsers);

      // Also update allUsers for stats
      const updatedAllUsers = await fetchAllUsers();
      setAllUsers(updatedAllUsers);

      showSuccess(`User promoted to ${adminRole} successfully`);
    } catch (error) {
      console.error("Failed to make user admin:", error);
      setError(error.message || "Failed to make user admin");
      showError(error.message || "Failed to make user admin");
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    {
      key: "emailVerified",
      label: "Email Verification Status",
      options: [
        { value: "true", label: "Verified" },
        { value: "false", label: "Not Verified" },
      ],
    },
    {
      key: "active",
      label: "Active Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  useEffect(() => {
    fetchAllUsers()
      .then(setAllUsers)
      .catch(() => setAllUsers([]));
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError(null);
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };
      fetchUsers(searchFilters)
        .then(setUsers)
        .catch((err) => setError(err.message || "Failed to fetch users"))
        .finally(() => setLoading(false));
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [filters, searchTerm]);

  // Calculate stats from allUsers
  const total = allUsers.length;
  const emailVerified = allUsers.filter((u) => u.isEmailVerified).length;
  const emailUnverified = total - emailVerified;
  const active = allUsers.filter((u) => u.isActive).length;
  const inactive = total - active;

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        {/* Title */}
        <h2 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Individual Users
        </h2>
        {/* SearchBar */}
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {/* Controls: Filter */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Filter Button */}
          <SecondaryButton
            icon={FiFilter}
            onClick={handleFilter}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Filter</span>
          </SecondaryButton>
        </div>
      </div>

      {/* Stats Cards Section with Toggle Button on Top */}
      <div className="mb-6 w-full">
        {/* Top Row: Toggle Button aligned right */}
        <div className="flex justify-end mb-2 w-full">
          <button
            className="flex items-center gap-1 px-3 py-2 border border-[color:var(--color-muted)] rounded bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)] transition-colors"
            onClick={() => setShowStats((prev) => !prev)}
            aria-label={showStats ? "Hide stats" : "Show stats"}
            type="button"
          >
            {showStats ? <FiChevronUp /> : <FiChevronDown />}
            <span className="hidden sm:inline text-xs font-medium">
              {showStats ? "Hide Stats" : "Show Stats"}
            </span>
          </button>
        </div>
        {/* Bottom Row: Stats Cards (responsive) */}
        {showStats && (
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <TotalStatsCard
              title="Total Users"
              value={total}
              icon={FiUsers}
              iconColor="#43e97b"
              className="flex-1"
            />
            <PieStatsCard
              title1="Email Verified"
              value1={emailVerified}
              icon1={FiCheckCircle}
              color1="#43e97b"
              label1="Verified"
              title2="Not Verified"
              value2={emailUnverified}
              icon2={FiUserX}
              color2="#3b82f6"
              label2="Not Verified"
              className="flex-1"
            />
            <PieStatsCard
              title1="Active"
              value1={active}
              icon1={FiActivity}
              color1="#facc15"
              label1="Active"
              title2="Inactive"
              value2={inactive}
              icon2={FiUserMinus}
              color2="#f87171"
              label2="Inactive"
              className="flex-1"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className="bg-[color:var(--color-background)] p-2 rounded-lg border border-[color:var(--color-muted)] shadow-md flex-1 min-h-0"
        style={{
          height: showStats
            ? "calc(100vh - 400px - 2rem)"
            : "calc(100vh - 180px - 2rem)",
          maxHeight: showStats
            ? "calc(100vh - 400px - 2rem)"
            : "calc(100vh - 180px - 2rem)",
        }}
      >
        {loading ? (
          <div className="text-center text-[color:var(--color-secondary-text)] py-8">
            Loading users...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="h-full overflow-hidden">
            <UserTable
              data={users}
              onView={handleView}
              onDeactivate={handleDeactivate}
              onMakeAdmin={handleMakeAdmin}
              filters={filters}
            />
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
      />
    </div>
  );
}

export default UsersTab;
