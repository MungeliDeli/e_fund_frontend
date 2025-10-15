import React, { useEffect, useMemo, useState } from "react";
import { FiFilter } from "react-icons/fi";
import SearchBar from "../../../../../components/SearchBar/SearchBar";
import { SecondaryButton } from "../../../../../components/Buttons";
import FilterModal from "../../../../../components/FilterModal";
import AuditLogsTable from "./AuditLogsTable";
import AuditDetailsModal from "./AuditDetailsModal";
import { fetchAuditLogs } from "./auditApi";

function AdminAuditLogsPage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({}); // { actionType, entityType }
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState({ key: "timestamp", direction: "desc" });
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const filterOptions = useMemo(
    () => [
      {
        key: "actionType",
        label: "Action Type",
        options: [
          { value: "CAMPAIGN_CREATED", label: "CAMPAIGN_CREATED" },
          { value: "DONATION_MADE", label: "DONATION_MADE" },
          { value: "USER_LOGIN", label: "USER_LOGIN" },
        ],
      },
      {
        key: "entityType",
        label: "Entity Type",
        options: [
          { value: "campaign", label: "campaign" },
          { value: "donation", label: "donation" },
          { value: "user", label: "user" },
        ],
      },
    ],
    []
  );

  // Debounced fetch
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { logs: fetched, pagination: p } = await fetchAuditLogs({
          page,
          limit: 50,
          search: searchTerm,
          actionType: filters.actionType,
          entityType: filters.entityType,
          sortBy: sort.key,
          sortOrder: sort.direction,
        });
        setLogs(fetched);
        setPagination(p);
      } catch (err) {
        setError(err?.message || "Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [page, searchTerm, filters, sort]);

  const onViewDetails = (row) => {
    setSelectedDetails(row.details);
    setDetailsOpen(true);
  };

  const onTableSortRequest = (key, direction) => setSort({ key, direction });

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-3xl font-bold text-[color:var(--color-primary-text)]">
          Audit Logs
        </h1>
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search audit logs..."
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
            Loading audit logs...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
              <AuditLogsTable
                data={logs}
                onViewDetails={onViewDetails}
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
      />

      <AuditDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={selectedDetails}
      />
    </div>
  );
}

export default AdminAuditLogsPage;
