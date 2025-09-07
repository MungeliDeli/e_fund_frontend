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
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import CampaignTable from "../../../../users/components/CampaignTable";
import { useNavigate } from "react-router-dom";
import { campaignStatuses } from "../../../utils/campaignStatusConfig";
import { getAllCampaigns } from "../../../services/campaignApi";

function CampaignPanel() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const [allCampaigns, setAllCampaigns] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Fetch all campaigns
  const fetchCampaigns = async (searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        ...searchFilters,
        search: searchTerm,
      };
      const response = await getAllCampaigns(filters);
      setAllCampaigns(response.data || []);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      setError("Failed to load campaigns. Please try again.");
      // Fallback to empty array on error
      setAllCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCampaigns();
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Calculate stats from allCampaigns
  const total = allCampaigns.length;
  const draft = allCampaigns.filter((c) => c.status === "draft").length;
  const pendingApproval = allCampaigns.filter(
    (c) => c.status === "pendingApproval"
  ).length;
  const pendingStart = allCampaigns.filter(
    (c) => c.status === "pendingStart"
  ).length;
  const active = allCampaigns.filter((c) => c.status === "active").length;
  const successful = allCampaigns.filter(
    (c) => c.status === "successful"
  ).length;
  const closed = allCampaigns.filter((c) => c.status === "closed").length;
  const cancelled = allCampaigns.filter((c) => c.status === "cancelled").length;
  const rejected = allCampaigns.filter((c) => c.status === "rejected").length;

  const handleFilter = () => setIsFilterModalOpen(true);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleCategories = () => {
    navigate("/admin/campaign-categories");
  };

  const handleView = (campaignId) => {
    navigate(`/campaigns/${campaignId}`);
  };

  // Filter options
  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "draft", label: "Draft" },
        { value: "pendingApproval", label: "Pending Approval" },
        { value: "pendingStart", label: "Pending Start" },
        { value: "active", label: "Active" },
        { value: "successful", label: "Successful" },
        { value: "closed", label: "Closed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    // Add more filter options as needed
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Campaigns
        </h1>
        {/* SearchBar */}
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

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
          <div className="flex flex-col sm:flex-row gap-6 w-full w-full">
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
          <div className="flex items-center justify-center py-8">
            <div className="text-[color:var(--color-primary-text)]">
              Loading campaigns...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500 text-center">
              <div className="mb-2">{error}</div>
              <button
                onClick={() => fetchCampaigns()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : allCampaigns.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[color:var(--color-primary-text)] text-center">
              <div className="mb-2">No campaigns found</div>
              <div className="text-sm text-[color:var(--color-muted-text)]">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filters"
                  : "No campaigns have been created yet"}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <CampaignTable
              data={allCampaigns}
              onView={handleView}
              filters={filters}
              viewMode="admin"
            />
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          fetchCampaigns(newFilters);
        }}
        filterOptions={filterOptions}
      />
    </div>
  );
}

export default CampaignPanel;
