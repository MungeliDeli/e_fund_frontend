import React, { useState, useEffect } from "react";
import {
  SecondaryButton,
  PrimaryButton,
} from "../../../../../components/Buttons";
import SearchBar from "../../../../../components/SearchBar/SearchBar";
import FilterModal from "../../../../../components/FilterModal";
import {
  TotalStatsCard,
  StatusStatsCard,
} from "../../../../../components/StatsCards";
import {
  FiFilter,
  FiLayers,
  FiFlag,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPlayCircle,
  FiCheckSquare,
  FiEdit2,
  FiPauseCircle,
  FiStopCircle,
} from "react-icons/fi";
import CampaignTable from "../../../../users/components/CampaignTable";
import { useNavigate } from "react-router-dom";

function CampaignPanel() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const [allCampaigns, setAllCampaigns] = useState([]);

  // TODO: Fetch all campaigns for stats
  useEffect(() => {
    // Example: fetchAllCampaigns().then(setAllCampaigns);
    // For now, use placeholder data
    setAllCampaigns([
      { status: "approved", isActive: true },
      { status: "pending", isActive: false },
      { status: "rejected", isActive: false },
      { status: "approved", isActive: true },
      { status: "approved", isActive: false },
      { status: "completed", isActive: false },
    ]);
  }, []);

  // Calculate stats from allCampaigns
  const total = allCampaigns.length;
  const approved = allCampaigns.filter((c) => c.status === "approved").length;
  const pending = allCampaigns.filter((c) => c.status === "pending").length;
  const rejected = allCampaigns.filter((c) => c.status === "rejected").length;
  const active = allCampaigns.filter((c) => c.isActive).length;
  const completed = allCampaigns.filter((c) => c.status === "completed").length;

  const handleFilter = () => setIsFilterModalOpen(true);
  const handleSearch = () => {};
  const handleCategories = () => {
    navigate("/admin/campaign-categories");
  };

  const handleView = (campaignId) => {
    // TODO: navigate to campaign details or open modal
    console.log("View campaign", campaignId);
  };

  // Placeholder filter options
  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
      ],
    },
    // Add more filter options as needed
  ];

  // All possible campaign statuses
  const campaignStatuses = [
    { key: "draft", label: "Draft", icon: FiEdit2, color: "#60a5fa" },
    { key: "pending", label: "Pending", icon: FiClock, color: "#facc15" },
    {
      key: "approved",
      label: "Approved",
      icon: FiCheckCircle,
      color: "#43e97b",
    },
    { key: "active", label: "Active", icon: FiPlayCircle, color: "#3b82f6" },
    {
      key: "successful",
      label: "Successful",
      icon: FiCheckSquare,
      color: "#10b981",
    },
    { key: "closed", label: "Closed", icon: FiStopCircle, color: "#ef4444" },
    { key: "cancelled", label: "Cancelled", icon: FiXCircle, color: "#ef4444" },
    {
      key: "completed",
      label: "Completed",
      icon: FiCheckSquare,
      color: "#38f9d7",
    },
    { key: "rejected", label: "Rejected", icon: FiXCircle, color: "#f87171" },
  ];

  // Build valueMap for status counts
  const valueMap = campaignStatuses.reduce((acc, s) => {
    acc[s.key] = allCampaigns.filter(
      (c) => (c.status || "").toLowerCase() === s.key
    ).length;
    return acc;
  }, {});

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-[color:var(--color-primary-text)]">
          Campaigns
        </h1>
        {/* SearchBar */}
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search..."
            value={""}
            onChange={handleSearch}
          />
        </div>
        {/* Controls: Filter, Categories */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <SecondaryButton
            icon={FiFilter}
            onClick={handleFilter}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Filter</span>
          </SecondaryButton>
          <PrimaryButton
            icon={FiLayers}
            onClick={handleCategories}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Categories</span>
          </PrimaryButton>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6 w-full">
        <TotalStatsCard
          title="Total Campaigns"
          value={total}
          icon={FiFlag}
          iconColor="#3b82f6"
          className="flex-1"
        />
        <StatusStatsCard
          statuses={campaignStatuses}
          valueMap={valueMap}
          initialStatusKey={campaignStatuses[0].key}
          className="flex-1"
        />
      </div>

      {/* Table */}
      <div className="bg-[color:var(--color-background)] p-2 rounded-lg border border-[color:var(--color-muted)] shadow-md min-h-[120px]">
        <CampaignTable
          data={allCampaigns}
          onView={handleView}
          filters={filters}
        />
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

export default CampaignPanel;
