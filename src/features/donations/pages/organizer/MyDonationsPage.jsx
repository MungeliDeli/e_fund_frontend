import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../../components/SearchBar/SearchBar";
import Table from "../../../../components/Table";
import { IconButton, SecondaryButton } from "../../../../components/Buttons";
import FilterModal from "../../../../components/FilterModal";
import Notification from "../../../../components/Notification";
import { FiEye } from "react-icons/fi";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  getDonationsByOrganizer,
  getAllDonations,
} from "../../services/donationsApi";

function truncate(text, max = 40) {
  if (!text) return "No message";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  } catch {
    return "-";
  }
}

function MyDonationsPage() {
  const { user } = useAuth();
  const organizerId = user?.userId;
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [notification, setNotification] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [sort, setSort] = useState({ key: "", direction: "asc" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If user is admin, fetch all donations; otherwise organizer-scoped
        const isAdmin = [
          "superAdmin",
          "supportAdmin",
          "eventModerator",
          "financialAdmin",
        ].includes(user?.userType);

        const donationsResp = isAdmin
          ? await getAllDonations({ limit: 200, offset: 0 })
          : organizerId
          ? await getDonationsByOrganizer(organizerId, {
              limit: 200,
              offset: 0,
            })
          : { data: { data: [] } };
        console.log("donationsResp", donationsResp);
        const donations = Array.isArray(donationsResp?.data?.data)
          ? donationsResp.data.data
          : [];

        const mapped = donations.map((d) => ({
          donationId: d.donationId,
          donorUserId: d.donorUserId,
          donorName: d.isAnonymous ? null : d.donorName || d.donorEmail || null,
          isAnonymous: !!d.isAnonymous,
          campaignId: d.campaignId,
          campaignName: d.campaignName,
          amount: d.amount,
          donationDate: d.donationDate,
          messageText: d.messageText || null,
          messageStatus: d.messageStatus || null,
        }));

        setRows(mapped);
      } catch (err) {
        console.error("Failed to fetch donations:", err);
        setError("Failed to load donations. Please try again.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizerId, user?.userType]);

  const filteredRows = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return rows.filter((r) => {
      const donor = r.isAnonymous ? "anonymous" : r.donorName || "";
      const msg = r.messageText || "";
      return (
        donor.toLowerCase().includes(term) ||
        (r.campaignName || "").toLowerCase().includes(term) ||
        String(r.amount || "").includes(term) ||
        msg.toLowerCase().includes(term)
      );
    });
  }, [rows, searchTerm]);

  const handleSort = (key, direction) => setSort({ key, direction });

  let processedRows = filteredRows;
  if (sort.key) {
    processedRows = [...processedRows].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const columns = [
    {
      key: "donor",
      label: "Donor",
      sortable: true,
      render: (row) => (
        <span className="text-[color:var(--color-primary-text)]">
          {row.isAnonymous ? "Anonymous" : row.donorName || "Anonymous"}
        </span>
      ),
    },
    {
      key: "campaignName",
      label: "Campaign",
      sortable: true,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs">
          ${parseFloat(row.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "donationDate",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs">{formatDate(row.donationDate)}</span>
      ),
    },
    {
      key: "messageText",
      label: "Message",
      sortable: false,
      render: (row) => (
        <span className="text-xs text-[color:var(--color-primary-text)]">
          {truncate(row.messageText, 50)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-2 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 w-full">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          My Donations
        </h1>
        <div className="flex-1 min-w-[180px]">
          <SearchBar
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <SecondaryButton
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
          <div className="flex items-center justify-center py-8">
            <div className="text-[color:var(--color-primary-text)]">
              Loading donations...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500 text-center">
              <div className="mb-2">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[color:var(--color-primary-text)] text-center">
              <div className="mb-2">No donations found</div>
              <div className="text-sm text-[color:var(--color-muted-text)]">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filters"
                  : "No donations yet"}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <Table
              columns={columns}
              data={processedRows}
              onSort={handleSort}
              sort={sort}
              scrollable={true}
              rowAction={(row) => (
                <IconButton
                  onClick={() => setSelectedDonation(row)}
                  className="px-4 py-1 border rounded text-[color:var(--color-primary-text)] border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                </IconButton>
              )}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] p-4 rounded-lg border border-[color:var(--color-muted)] shadow-lg w-full max-w-lg mx-4">
            <div className="flex items-center justify-between pb-2 border-b border-[color:var(--color-muted)]">
              <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                Donation Details
              </h2>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 hover:bg-[color:var(--color-muted)] rounded transition-colors"
              >
                Close
              </button>
            </div>
            <div className="py-3 space-y-2 text-[color:var(--color-primary-text)]">
              <div>
                <span className="font-medium">Donor: </span>
                {selectedDonation.isAnonymous
                  ? "Anonymous"
                  : selectedDonation.donorName || "Anonymous"}
              </div>
              <div>
                <span className="font-medium">Campaign: </span>
                {selectedDonation.campaignName}
              </div>
              <div>
                <span className="font-medium">Amount: </span>$
                {parseFloat(selectedDonation.amount || 0).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Date: </span>
                {formatDate(selectedDonation.donationDate)}
              </div>
              <div>
                <span className="font-medium">Message status: </span>
                {selectedDonation.messageStatus || "-"}
              </div>
              <div>
                <span className="font-medium">Message: </span>
                <div className="mt-1 whitespace-pre-wrap text-sm">
                  {selectedDonation.messageText || "No message"}
                </div>
              </div>
            </div>
            <div className="pt-3 flex justify-end">
              <SecondaryButton onClick={() => setSelectedDonation(null)}>
                Close
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={[]}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default MyDonationsPage;
