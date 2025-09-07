import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMessagesByCampaignForOrganizer,
  getCampaignMessageStats,
  moderateMessage,
  toggleFeaturedStatus,
  bulkApproveAllMessages,
  bulkRejectAllMessages,
} from "../../donations/services/messagesApi";
import Notification from "../../../components/Notification";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "../../../components/Buttons";
import { FaStar, FaRegStar, FaChevronLeft } from "react-icons/fa";
import SearchBar from "../../../components/SearchBar/SearchBar";

const STATUS_TABS = [
  { key: "pendingModeration", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "featured", label: "Featured" },
];

export default function MessagesManagementPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    featuredCount: 0,
  });
  const [status, setStatus] = useState("pendingModeration");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        (m.messageText || "").toLowerCase().includes(q) ||
        (m.donorEmail || "").toLowerCase().includes(q)
    );
  }, [messages, search]);

  const page = Math.floor(offset / limit) + 1;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (offset === 0) setLoading(true);
        else setRefreshing(true);
        // Load stats (for badges)
        const statsRes = await getCampaignMessageStats(campaignId);
        if (!mounted) return;
        setStats(statsRes.data || statsRes);

        // Load messages
        const msgsRes = await getMessagesByCampaignForOrganizer(campaignId, {
          status: status === "featured" ? "approved" : status,
          limit,
          offset,
        });
        if (!mounted) return;
        // If "featured" tab, filter approved list by isFeatured
        const list = Array.isArray(msgsRes.data) ? msgsRes.data : msgsRes;
        setMessages(
          status === "featured" ? list.filter((m) => m.isFeatured) : list
        );
        setError("");
      } catch (e) {
        const msg =
          e?.response?.data?.message || e?.message || "Failed to load messages";
        setError(msg);
        setToastType("error");
        setToastMessage(msg);
        setToastVisible(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [campaignId, status, limit, offset]);

  const showToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleApprove = async (messageId) => {
    try {
      await moderateMessage(messageId, { status: "approved" });
      showToast("success", "Message approved");
      // refresh current page
      setRefreshing(true);
      const msgsRes = await getMessagesByCampaignForOrganizer(campaignId, {
        status: status === "featured" ? "approved" : status,
        limit,
        offset,
      });
      const list = Array.isArray(msgsRes.data) ? msgsRes.data : msgsRes;
      setMessages(
        status === "featured" ? list.filter((m) => m.isFeatured) : list
      );
    } catch (e) {
      showToast(
        "error",
        e?.response?.data?.message || e?.message || "Failed to approve"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleReject = async (messageId) => {
    try {
      await moderateMessage(messageId, { status: "rejected" });
      showToast("success", "Message rejected");
      setRefreshing(true);
      const msgsRes = await getMessagesByCampaignForOrganizer(campaignId, {
        status: status === "featured" ? "approved" : status,
        limit,
        offset,
      });
      const list = Array.isArray(msgsRes.data) ? msgsRes.data : msgsRes;
      setMessages(
        status === "featured" ? list.filter((m) => m.isFeatured) : list
      );
    } catch (e) {
      showToast(
        "error",
        e?.response?.data?.message || e?.message || "Failed to reject"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleFeatured = async (messageId) => {
    try {
      await toggleFeaturedStatus(messageId);
      showToast("success", "Featured status updated");
      setRefreshing(true);
      const msgsRes = await getMessagesByCampaignForOrganizer(campaignId, {
        status: status === "featured" ? "approved" : status,
        limit,
        offset,
      });
      const list = Array.isArray(msgsRes.data) ? msgsRes.data : msgsRes;
      setMessages(
        status === "featured" ? list.filter((m) => m.isFeatured) : list
      );
    } catch (e) {
      showToast(
        "error",
        e?.response?.data?.message || e?.message || "Failed to update featured"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleBulkApproveAll = async () => {
    try {
      await bulkApproveAllMessages(campaignId);
      showToast("success", "All pending messages approved");
      setOffset(0);
    } catch (e) {
      showToast(
        "error",
        e?.response?.data?.message || e?.message || "Failed to bulk approve"
      );
    }
  };

  const handleBulkRejectAll = async () => {
    try {
      await bulkRejectAllMessages(campaignId);
      showToast("success", "All pending messages rejected");
      setOffset(0);
    } catch (e) {
      showToast(
        "error",
        e?.response?.data?.message || e?.message || "Failed to bulk reject"
      );
    }
  };

  const nextPage = () => setOffset((prev) => prev + limit);
  const prevPage = () => setOffset((prev) => Math.max(0, prev - limit));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Notification
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={4000}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Messages
        </h1>
        <div className="flex-1 flex justify-center">
          <SearchBar
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <SecondaryButton onClick={() => navigate(-1)}>
            <span className="flex items-center gap-2">
              <FaChevronLeft /> Back
            </span>
          </SecondaryButton>
        </div>
      </div>

      {/* Filters & actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.key === "pendingModeration"
                ? stats.pendingCount
                : tab.key === "approved"
                ? stats.approvedCount
                : tab.key === "rejected"
                ? stats.rejectedCount
                : stats.featuredCount;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatus(tab.key);
                  setOffset(0);
                }}
                className={`relative px-3 py-1 rounded-full border text-sm transition-colors ${
                  status === tab.key
                    ? "bg-[color:var(--color-primary)] text-white border-transparent"
                    : "bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] hover:bg-[color:var(--color-muted)]"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
        {status === "pendingModeration" && (
          <>
            <SecondaryButton onClick={handleBulkRejectAll}>
              Reject All
            </SecondaryButton>
            <PrimaryButton onClick={handleBulkApproveAll}>
              Approve All
            </PrimaryButton>
          </>
        )}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-[color:var(--color-muted)] bg-[color:var(--color-surface)]">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-6 text-[color:var(--color-secondary-text)]">
            No messages found.
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--color-muted)]">
            {filteredMessages.map((m) => (
              <li key={m.messageId} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 text-xs text-[color:var(--color-secondary-text)]">
                      <span>{new Date(m.postedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{m.donorEmail || "Anonymous"}</span>
                      {m.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[color:var(--color-primary-text)] whitespace-pre-wrap">
                      {m.messageText}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status !== "approved" && (
                      <PrimaryButton onClick={() => handleApprove(m.messageId)}>
                        Approve
                      </PrimaryButton>
                    )}
                    {m.status !== "rejected" && (
                      <SecondaryButton
                        onClick={() => handleReject(m.messageId)}
                      >
                        Reject
                      </SecondaryButton>
                    )}
                    {m.status === "approved" && (
                      <IconButton
                        onClick={() => handleToggleFeatured(m.messageId)}
                        icon={m.isFeatured ? FaStar : FaRegStar}
                        className={`px-3 py-2 rounded-lg border ${
                          m.isFeatured
                            ? "text-amber-600 border-amber-200 bg-amber-50"
                            : "text-[color:var(--color-primary-text)] border-[color:var(--color-muted)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-muted)]"
                        }`}
                        title={m.isFeatured ? "Unfeature" : "Feature"}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-[color:var(--color-secondary-text)]">
          Page {page}
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={() => setOffset(0)} disabled={offset === 0}>
            First
          </SecondaryButton>
          <SecondaryButton onClick={prevPage} disabled={offset === 0}>
            Prev
          </SecondaryButton>
          <SecondaryButton
            onClick={nextPage}
            disabled={filteredMessages.length < limit}
          >
            Next
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
