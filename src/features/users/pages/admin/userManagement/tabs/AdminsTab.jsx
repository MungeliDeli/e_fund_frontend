import React, { useState, useEffect } from "react";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../../../../../components/Buttons";
import {
  FiFilter,
  FiPlus,
  FiShield,
  FiCheckCircle,
  FiUserX,
  FiActivity,
  FiUserMinus,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import SearchBar from "../../../../../../components/SearchBar/SearchBar";
import AdminTable from "../../../../components/AdminTable";
import FilterModal from "../../../../../../components/FilterModal";
import {
  fetchAdmins,
  fetchAllAdmins,
  toggleUserStatus,
  removeAdminPrivileges,
} from "../../../../services/usersApi";
import {
  TotalStatsCard,
  PieStatsCard,
} from "../../../../../../components/StatsCards";

function AdminsTab() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [admins, setAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
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

  const handleAddAdmin = () => {
    // TODO: Navigate to add admin page or open add admin modal
    console.log("Add admin clicked");
  };

  const handleView = (adminId) => {
    // Action button does nothing for now as requested
    console.log("View admin:", adminId);
  };

  const handleDeactivate = async (adminId) => {
    try {
      setLoading(true);
      setError(null);

      // Find the admin to get current status
      const admin = admins.find((a) => a.userId === adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }

      // Toggle the admin's active status
      const newStatus = !admin.isActive;
      await toggleUserStatus(adminId, newStatus);

      // Refresh the data after successful toggle
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };
      const updatedAdmins = await fetchAdmins(searchFilters);
      setAdmins(updatedAdmins);

      // Also update allAdmins for stats
      const updatedAllAdmins = await fetchAllAdmins();
      setAllAdmins(updatedAllAdmins);

      console.log(
        `Admin ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Failed to toggle admin status:", error);
      setError(error.message || "Failed to toggle admin status");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      setLoading(true);
      setError(null);

      // Remove admin privileges
      await removeAdminPrivileges(adminId);

      // Refresh the data after successful removal
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };
      const updatedAdmins = await fetchAdmins(searchFilters);
      setAdmins(updatedAdmins);

      // Also update allAdmins for stats
      const updatedAllAdmins = await fetchAllAdmins();
      setAllAdmins(updatedAllAdmins);

      console.log("Admin privileges removed successfully");
    } catch (error) {
      console.error("Failed to remove admin privileges:", error);
      setError(error.message || "Failed to remove admin privileges");
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
    fetchAllAdmins()
      .then(setAllAdmins)
      .catch(() => setAllAdmins([]));
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
      fetchAdmins(searchFilters)
        .then(setAdmins)
        .catch((err) => setError(err.message || "Failed to fetch admins"))
        .finally(() => setLoading(false));
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [filters, searchTerm]);

  // Calculate stats from allAdmins
  const total = allAdmins.length;
  const emailVerified = allAdmins.filter((a) => a.isEmailVerified).length;
  const emailUnverified = total - emailVerified;
  const active = allAdmins.filter((a) => a.isActive).length;
  const inactive = total - active;

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        {/* Title */}
        <h2 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Administrators
        </h2>
        {/* SearchBar */}
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search admins..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {/* Controls: Filter, Add */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Filter Button */}
          <SecondaryButton
            icon={FiFilter}
            onClick={handleFilter}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Filter</span>
          </SecondaryButton>
          {/* Add Admin Button */}
          <PrimaryButton
            icon={FiPlus}
            onClick={handleAddAdmin}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Add Admin</span>
          </PrimaryButton>
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
              title="Total Admins"
              value={total}
              icon={FiShield}
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
            Loading admins...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="h-full overflow-hidden">
            <AdminTable
              data={admins}
              onView={handleView}
              onDeactivate={handleDeactivate}
              onRemoveAdmin={handleRemoveAdmin}
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

export default AdminsTab;
