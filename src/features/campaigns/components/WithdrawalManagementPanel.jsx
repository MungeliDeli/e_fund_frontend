import React, { useState, useEffect } from "react";
import { SecondaryButton, PrimaryButton } from "../../../components/Buttons";
import SearchBar from "../../../components/SearchBar/SearchBar";
import FilterModal from "../../../components/FilterModal";
import SearchableDropdown from "../../../components/SearchableDropdown";
import {
  TotalStatsCard,
  StatusStatsCard,
} from "../../../components/StatsCards";
import {
  FiFilter,
  FiClock,
  FiChevronUp,
  FiChevronDown,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import WithdrawalTable from "./WithdrawalTable";
import WithdrawalActionModal from "./WithdrawalActionModal";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from "../services/adminWithdrawApi";
import { getMyWithdrawals } from "../services/withdrawApi";
import { getAllCampaigns } from "../services/campaignApi";
import { fetchOrganizers } from "../../users/services/usersApi";
import Notification from "../../../components/Notification";
import { useAuth } from "../../../contexts/AuthContext";

const ADMIN_WITHDRAWAL_STATUSES = [
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "approved", label: "Approved", color: "#3b82f6" },
  { key: "rejected", label: "Rejected", color: "#ef4444" },
  { key: "processing", label: "Processing", color: "#8b5cf6" },
  { key: "paid", label: "Paid", color: "#10b981" },
  { key: "failed", label: "Failed", color: "#ef4444" },
];

function WithdrawalManagementPanel({ isAdmin = false }) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  const [withdrawals, setWithdrawals] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast notification
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Filter data
  const [campaigns, setCampaigns] = useState([]);
  const [organizers, setOrganizers] = useState([]);

  const ITEMS_PER_PAGE = 30;

  // Fetch withdrawal requests
  const fetchWithdrawals = async (searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const requestFilters = {
        ...searchFilters,
        search: searchTerm,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortField,
        sortDirection,
        ...(showPendingOnly && { status: "pending" }),
      };

      let response;
      if (isAdmin) {
        response = await fetchAdminWithdrawals(requestFilters);
        setWithdrawals(response.data?.data || []);
        setTotalPages(response.data?.pagination?.totalPages || 1);
        setTotalCount(response.data?.pagination?.totalCount || 0);
        console.log("response", response);
      } else {
        response = await getMyWithdrawals(requestFilters);
        setWithdrawals(response.items || []);
        setTotalPages(response.data?.pagination?.totalPages || 1);
        setTotalCount(response.data?.pagination?.totalCount || 0);
        console.log("response", response);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
      setError("Failed to load withdrawal requests. Please try again.");
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter data
  const fetchFilterData = async () => {
    try {
      if (isAdmin) {
        const [campaignsRes, organizersRes] = await Promise.all([
          getAllCampaigns({ limit: 1000 }),
          fetchOrganizers({ limit: 1000 }),
        ]);
        setCampaigns(campaignsRes.data || []);
        setOrganizers(organizersRes || []);
      } else {
        // For organizer, only fetch campaigns they own
        const campaignsRes = await getAllCampaigns({ limit: 1000 });
        setCampaigns(campaignsRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch filter data:", error);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWithdrawals();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, showPendingOnly, currentPage, sortField, sortDirection]);

  // Initial data fetch
  useEffect(() => {
    fetchWithdrawals();
    fetchFilterData();
  }, []);

  // Calculate stats from withdrawals
  const total = totalCount;
  const totalWithdrawAmount = withdrawals.reduce((sum, w) => {
    const amount = Number(w.amount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const pending = withdrawals.filter((w) => w.status === "pending").length;
  const approved = withdrawals.filter((w) => w.status === "approved").length;
  const rejected = withdrawals.filter((w) => w.status === "rejected").length;
  const processing = withdrawals.filter(
    (w) => w.status === "processing"
  ).length;
  const paid = withdrawals.filter((w) => w.status === "paid").length;
  const failed = withdrawals.filter((w) => w.status === "failed").length;

  const handleFilter = () => setIsFilterModalOpen(true);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePendingToggle = () => {
    setShowPendingOnly(!showPendingOnly);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleWithdrawalAction = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setActionModalOpen(true);
  };

  const handleApprove = async (withdrawalRequestId, notes) => {
    if (!isAdmin) return;

    setActionLoading(true);
    try {
      await approveWithdrawal(withdrawalRequestId, notes);
      setToastMessage("Withdrawal request approved successfully");
      setToastType("success");
      setToastVisible(true);
      fetchWithdrawals(); // Refresh data
    } catch (error) {
      setToastMessage(error?.response?.data?.message || "Approval failed");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (withdrawalRequestId, reason) => {
    if (!isAdmin) return;

    setActionLoading(true);
    try {
      await rejectWithdrawal(withdrawalRequestId, reason);
      setToastMessage("Withdrawal request rejected successfully");
      setToastType("success");
      setToastVisible(true);
      fetchWithdrawals(); // Refresh data
    } catch (error) {
      setToastMessage(error?.response?.data?.message || "Rejection failed");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCampaign = (campaignId) => {
    navigate(`/campaigns/${campaignId}`);
  };

  // Filter options for modal
  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: ADMIN_WITHDRAWAL_STATUSES.map((status) => ({
        value: status.key,
        label: status.label,
      })),
    },
    {
      key: "campaignId",
      label: "Campaign",
      options: campaigns.map((campaign) => ({
        value: campaign.campaignId,
        label: campaign.name,
      })),
    },
    // Only show organizer filter for admin
    ...(isAdmin
      ? [
          {
            key: "organizerId",
            label: "Organizer",
            options: organizers.map((organizer) => ({
              value: organizer.userId,
              label: organizer.organizationName,
            })),
          },
        ]
      : []),
  ];

  // Build valueMap for status counts
  const valueMap = ADMIN_WITHDRAWAL_STATUSES.reduce((acc, status) => {
    acc[status.key] = withdrawals.filter((w) => w.status === status.key).length;
    return acc;
  }, {});

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <Notification
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={4000}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          {isAdmin ? "Withdrawal Requests" : "My Withdrawals"}
        </h1>
        {/* SearchBar */}
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder={`Search ${
              isAdmin ? "withdrawal requests" : "my withdrawals"
            }...`}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Pending Withdrawals Badge */}
          {pending > 0 && (
            <button
              onClick={handlePendingToggle}
              className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showPendingOnly
                  ? " border-[color:var(--color-primary)] text-[color:var(--color-text)]"
                  : " border-[color:var(--color-primary)] text-[color:var(--color-text)] hover:border-[color:var(--color-primary)]"
              }`}
              type="button"
            >
              <FiClock className="w-4 h-4" />
              <span className="font-medium">Pending</span>
              <span className="absolute -top-2 -left-2 bg-[color:var(--color-primary)] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {pending}
              </span>
            </button>
          )}
          <SecondaryButton
            icon={FiFilter}
            onClick={handleFilter}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Filter</span>
          </SecondaryButton>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="mb-6 w-full">
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
        {showStats && (
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <TotalStatsCard
              title="Total Withdrawals"
              value={total}
              icon={FiDollarSign}
              iconColor="#10b981"
              className="flex-1"
            />
            <TotalStatsCard
              title="Total Withdraw Amount"
              value={new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "ZMW",
              }).format(totalWithdrawAmount)}
              icon={FiDollarSign}
              iconColor="#10b981"
              className="flex-1"
            />
            <StatusStatsCard
              statuses={ADMIN_WITHDRAWAL_STATUSES}
              valueMap={valueMap}
              icon={FiCheckCircle}
              initialStatusKey={ADMIN_WITHDRAWAL_STATUSES[0].key}
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
        <WithdrawalTable
          data={withdrawals}
          onAction={handleWithdrawalAction}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          loading={loading}
          isAdmin={isAdmin}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <SecondaryButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </SecondaryButton>
          <span className="text-[color:var(--color-primary-text)]">
            Page {currentPage} of {totalPages}
          </span>
          <SecondaryButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </SecondaryButton>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
          fetchWithdrawals(newFilters);
        }}
        filterOptions={filterOptions}
      />

      {/* Action Modal */}
      <WithdrawalActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        withdrawal={selectedWithdrawal}
        onApprove={isAdmin ? handleApprove : null}
        onReject={isAdmin ? handleReject : null}
        onViewCampaign={handleViewCampaign}
        loading={actionLoading}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export default WithdrawalManagementPanel;
