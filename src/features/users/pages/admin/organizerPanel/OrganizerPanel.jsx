import React, { useState, useEffect } from "react";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../../../../components/Buttons";
import {
  FiFilter,
  FiPlus,
  FiUsers,
  FiCheckCircle,
  FiUserX,
  FiActivity,
  FiUserMinus,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import SearchBar from "../../../../../components/SearchBar/SearchBar";
import { useNavigate } from "react-router-dom";
import OrganizerTable from "../../../components/OrganizerTable";
import FilterModal from "../../../../../components/FilterModal";
import {
  fetchOrganizers,
  fetchAllOrganizers,
} from "../../../services/usersApi";
import {
  TotalStatsCard,
  PieStatsCard,
} from "../../../../../components/StatsCards";

function OrganizerPanel() {
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [organizers, setOrganizers] = useState([]);
  const [allOrganizers, setAllOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleSearch = () => {};

  const handleView = (organizerId) => {
    navigate(`/admin/organizers/${organizerId}`);
  };

  const filterOptions = [
    {
      key: "verified",
      label: "Verified Status",
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
    // Fetch all organizers for stats (only once)
    fetchAllOrganizers()
      .then(setAllOrganizers)
      .catch(() => setAllOrganizers([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrganizers(filters)
      .then(setOrganizers)
      .catch((err) => setError(err.message || "Failed to fetch organizers"))
      .finally(() => setLoading(false));
  }, [filters]);

  // Calculate stats from allOrganizers
  const total = allOrganizers.length;
  const verified = allOrganizers.filter((o) => o.status === "VERIFIED").length;
  const unverified = total - verified;
  const active = allOrganizers.filter((o) => o.active).length;
  const inactive = total - active;

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-[color:var(--color-primary-text)]">
          Organizers
        </h1>
        {/* SearchBar */}
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search..."
            value={""}
            onChange={handleSearch}
          />
        </div>
        {/* Controls:  Filter, Add */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Filter Button */}
          <SecondaryButton
            icon={FiFilter}
            onClick={handleFilter}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Filter</span>
          </SecondaryButton>
          {/* Add Organizer Button */}
          <PrimaryButton
            icon={FiPlus}
            onClick={() => navigate("/admin/organizers/add")}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Add Organizer</span>
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
              title="Total Organizers"
              value={total}
              icon={FiUsers}
              iconColor="#43e97b"
              className="flex-1"
            />
            <PieStatsCard
              title1="Verified"
              value1={verified}
              icon1={FiCheckCircle}
              color1="#43e97b"
              label1="Verified"
              title2="Unverified"
              value2={unverified}
              icon2={FiUserX}
              color2="#3b82f6"
              label2="Unverified"
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
      <div className="bg-[color:var(--color-background)] p-2 rounded-lg border border-[color:var(--color-muted)] shadow-md min-h-[120px]">
        {loading ? (
          <div className="text-center text-[color:var(--color-secondary-text)] py-8">
            Loading organizers...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <OrganizerTable
            data={organizers}
            onView={handleView}
            filters={filters}
          />
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

export default OrganizerPanel;
