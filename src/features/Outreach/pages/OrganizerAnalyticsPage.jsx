import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Notification from "../../../components/Notification";
import { getOrganizerAnalytics } from "../services/outreachApi";

const OrganizerAnalyticsPage = () => {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ dateRange: "30d", type: "all" });

  const dateRanges = useMemo(
    () => [
      { value: "7d", label: "Last 7 days" },
      { value: "30d", label: "Last 30 days" },
      { value: "90d", label: "Last 90 days" },
      { value: "all", label: "All time" },
    ],
    []
  );

  const emailTypes = useMemo(
    () => [
      { value: "all", label: "All types" },
      { value: "invite", label: "Invitations" },
      { value: "update", label: "Updates" },
      { value: "thanks", label: "Thank you" },
    ],
    []
  );

  const loadAnalytics = async (override) => {
    setLoading(true);
    setError(null);
    try {
      const params = override || filters;
      const data = await getOrganizerAnalytics(params);
      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Failed to load organizer analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[color:var(--color-text)]">
            Outreach Analytics
          </h1>
          <p className="text-[color:var(--color-secondary-text)] mt-1">
            Cross-campaign analytics for your organizer account
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <select
                className="px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)]"
                value={filters.dateRange}
                onChange={(e) => {
                  const next = { ...filters, dateRange: e.target.value };
                  setFilters(next);
                  loadAnalytics(next);
                }}
              >
                {dateRanges.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-[color:var(--color-muted)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-text)]"
                value={filters.type}
                onChange={(e) => {
                  const next = { ...filters, type: e.target.value };
                  setFilters(next);
                  loadAnalytics(next);
                }}
              >
                {emailTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => loadAnalytics()}
              className="px-4 py-2 border border-[color:var(--color-muted)] rounded-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-10 text-[color:var(--color-secondary-text)]">
            Loading analytics...
          </div>
        ) : !analytics ? (
          <div className="text-center py-10 text-[color:var(--color-secondary-text)]">
            No analytics data available
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Emails Sent",
                  value: analytics.emailsSent || 0,
                },
                {
                  label: "Opens",
                  value: analytics.opens || 0,
                },
                {
                  label: "Clicks",
                  value: analytics.clicks || 0,
                },
                {
                  label: "Donations",
                  value: analytics.donations || 0,
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center"
                >
                  <div className="text-sm text-[color:var(--color-secondary-text)] mb-1">
                    {kpi.label}
                  </div>
                  <div className="text-2xl font-semibold text-[color:var(--color-text)]">
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Rates and Revenue */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center">
                <div className="text-sm text-[color:var(--color-secondary-text)] mb-1">
                  Open Rate
                </div>
                <div className="text-xl font-semibold text-[color:var(--color-text)]">
                  {analytics.openRate || "0%"}
                </div>
              </div>
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center">
                <div className="text-sm text-[color:var(--color-secondary-text)] mb-1">
                  Click Rate
                </div>
                <div className="text-xl font-semibold text-[color:var(--color-text)]">
                  {analytics.clickRate || "0%"}
                </div>
              </div>
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-lg p-4 text-center">
                <div className="text-sm text-[color:var(--color-secondary-text)] mb-1">
                  Revenue (UGX)
                </div>
                <div className="text-xl font-semibold text-[color:var(--color-text)]">
                  {analytics.revenue || 0}
                </div>
              </div>
            </div>

            {/* Top performers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-lg p-4">
                <div className="text-base font-semibold text-[color:var(--color-text)] mb-3">
                  Top Segments
                </div>
                <div className="space-y-2">
                  {(analytics.topSegments || []).slice(0, 5).map((s) => (
                    <div
                      key={s.segmentId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[color:var(--color-text)]">
                        {s.name}
                      </span>
                      <span className="text-[color:var(--color-secondary-text)]">
                        {s.clicks || 0} clicks · {s.opens || 0} opens
                      </span>
                    </div>
                  ))}
                  {(!analytics.topSegments ||
                    analytics.topSegments.length === 0) && (
                    <div className="text-[color:var(--color-secondary-text)]">
                      No segment data
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-lg p-4">
                <div className="text-base font-semibold text-[color:var(--color-text)] mb-3">
                  Top Contacts
                </div>
                <div className="space-y-2">
                  {(analytics.topContacts || []).slice(0, 5).map((c) => (
                    <div
                      key={c.contactId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[color:var(--color-text)]">
                        {c.name || c.email}
                      </span>
                      <span className="text-[color:var(--color-secondary-text)]">
                        {c.clicks || 0} clicks · {c.opens || 0} opens
                      </span>
                    </div>
                  ))}
                  {(!analytics.topContacts ||
                    analytics.topContacts.length === 0) && (
                    <div className="text-[color:var(--color-secondary-text)]">
                      No contact data
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <Notification
            type="error"
            message={error}
            isVisible={!!error}
            onClose={() => setError(null)}
            duration={5000}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizerAnalyticsPage;
