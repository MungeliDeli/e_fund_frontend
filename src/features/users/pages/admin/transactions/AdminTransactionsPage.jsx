import React, { useEffect, useMemo, useState } from "react";
import { FiFilter } from "react-icons/fi";
import SearchBar from "../../../../../components/SearchBar/SearchBar";
import { SecondaryButton } from "../../../../../components/Buttons";
import FilterModal from "../../../../../components/FilterModal";
import SearchableDropdown from "../../../../../components/SearchableDropdown";
import TransactionTable from "./TransactionTable";
import {
  fetchAdminTransactions,
  fetchCampaignsForFilter,
} from "../../../services/transactionsApi";

function AdminTransactionsPage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({}); // { campaignId, status }
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState({
    key: "transactionTimestamp",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const filterOptions = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        options: [
          { value: "succeeded", label: "Succeeded" },
          { value: "failed", label: "Failed" },
          { value: "pending", label: "Pending" },
        ],
      },
    ],
    []
  );

  // Fetch campaigns for dropdown
  useEffect(() => {
    fetchCampaignsForFilter()
      .then(setCampaigns)
      .catch(() => setCampaigns([]));
  }, []);

  // Debounced fetch
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { transactions: fetched, pagination: p } =
          await fetchAdminTransactions({
            page,
            limit: 50,
            search: searchTerm,
            campaignId: filters.campaignId,
            status: filters.status,
            sortBy: sort.key,
            sortOrder: sort.direction,
          });
        setTransactions(fetched);
        setPagination(p);
      } catch (err) {
        setError(err?.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [page, searchTerm, filters, sort]);

  const onTableSortRequest = (key, direction) => setSort({ key, direction });

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-3xl font-bold text-[color:var(--color-primary-text)]">
          Transactions
        </h1>
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <SecondaryButton
            icon={FiFilter}
            onClick={() => setIsFilterModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Filter</span>
          </SecondaryButton>
        </div>
      </div>

      <div
        className="bg-[color:var(--color-background)] p-2 rounded-lg border border-[color:var(--color-muted)] shadow-md flex-1 min-h-0"
        style={{
          height: "calc(100vh - 180px - 2rem)",
          maxHeight: "calc(100vh - 180px - 2rem)",
        }}
      >
        {loading ? (
          <div className="text-center text-[color:var(--color-secondary-text)] py-8">
            Loading transactions...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
              <TransactionTable
                data={transactions}
                onSort={onTableSortRequest}
                sort={sort}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[color:var(--color-secondary-text)]">
              <div>
                Page {pagination.page} of {pagination.totalPages || 1} •{" "}
                {pagination.total || 0} total
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50 text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:bg-[color:var(--color-muted)] transition-colors"
                >
                  Prev
                </button>
                <button
                  disabled={pagination.page >= (pagination.totalPages || 1)}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages || 1, p + 1))
                  }
                  className="px-3 py-1 border rounded disabled:opacity-50 text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:bg-[color:var(--color-muted)] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        filterOptions={filterOptions}
        customFilters={[
          {
            key: "campaignId",
            label: "Campaign",
            component: (
              <SearchableDropdown
                options={campaigns}
                value={filters.campaignId || ""}
                onChange={(value) => {
                  setFilters((prev) => ({ ...prev, campaignId: value }));
                }}
                placeholder="Select campaign..."
                className="w-full"
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export default AdminTransactionsPage;
