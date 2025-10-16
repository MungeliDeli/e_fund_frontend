import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import MetaCard from "../components/MetaCard";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons";
import { getCampaignsByOrganizer } from "../services/campaignApi";
import {
  getDonationsByOrganizer,
  getDonationStats,
} from "../../donations/services/donationsApi";
import {
  FiFlag,
  FiTrendingUp,
  FiDownloadCloud,
  FiUsers,
  FiPlusCircle,
} from "react-icons/fi";

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "-";
  try {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  } catch {
    return `K${Number(amount || 0).toFixed(0)}`;
  }
}

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [campaignRaisedMap, setCampaignRaisedMap] = useState({});

  // Load campaigns and donations, and compute aggregates
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.userId) return;
      setLoading(true);
      setError("");
      try {
        // Fetch organizer campaigns and donations in parallel
        const [campaignsResp, donationsResp] = await Promise.all([
          getCampaignsByOrganizer({ limit: 100 }),
          getDonationsByOrganizer(user.userId, { limit: 500 }),
        ]);

        const campaignRows =
          campaignsResp?.data?.data ||
          campaignsResp?.data ||
          campaignsResp ||
          [];
        const donationRows =
          donationsResp?.data?.data ||
          donationsResp?.data ||
          donationsResp ||
          [];

        if (!mounted) return;
        setCampaigns(Array.isArray(campaignRows) ? campaignRows : []);
        setDonations(Array.isArray(donationRows) ? donationRows : []);

        // For bar chart: total raised per campaign
        // Prefer campaign.currentRaisedAmount if present, otherwise fetch stats per campaign
        const initialRaised = {};
        const needStats = [];
        (Array.isArray(campaignRows) ? campaignRows : []).forEach((c) => {
          const val = Number(c.currentRaisedAmount ?? c.totalRaised ?? 0);
          if (val > 0) {
            initialRaised[c.campaignId] = val;
          } else {
            needStats.push(c.campaignId);
          }
        });

        let fetchedMap = {};
        if (needStats.length > 0) {
          // Fetch per-campaign totals in batches (parallel but bounded by Promise.all)
          const statPromises = needStats.map(async (cid) => {
            try {
              const stats = await getDonationStats(cid);
              return {
                cid,
                total: Number(stats?.totalAmount || stats?.totalRaised || 0),
              };
            } catch {
              return { cid, total: 0 };
            }
          });
          const results = await Promise.all(statPromises);
          fetchedMap = results.reduce((acc, r) => {
            acc[r.cid] = r.total || 0;
            return acc;
          }, {});
        }

        if (!mounted) return;
        setCampaignRaisedMap({ ...initialRaised, ...fetchedMap });
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load organizer dashboard");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.userId]);

  const totals = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const totalDonations = campaigns.reduce(
      (sum, c) => sum + Number(c.donationCount || 0),
      0
    );
    const totalRaised = campaigns.reduce((sum, c) => {
      const raised = campaignRaisedMap[c.campaignId];
      return sum + Number(raised ?? 0);
    }, 0);
    const totalWithdrawn = campaigns.reduce(
      (sum, c) => sum + Number(c.totalWithdrawn || 0),
      0
    );
    return { totalCampaigns, totalDonations, totalRaised, totalWithdrawn };
  }, [campaigns, campaignRaisedMap]);

  const barChartData = useMemo(() => {
    // Build [{label, value, color}] for campaigns
    const palette = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
    ];
    return (campaigns || []).slice(0, 8).map((c, idx) => ({
      label: (c.name || "Campaign").slice(0, 16),
      value: Number(campaignRaisedMap[c.campaignId] || 0),
      color: palette[idx % palette.length],
    }));
  }, [campaigns, campaignRaisedMap]);

  const pieChart = useMemo(() => {
    const raised = totals.totalRaised || 0;
    const withdrawn = totals.totalWithdrawn || 0;
    const available = Math.max(raised - withdrawn, 0);
    return [
      { label: "Withdrawn", value: withdrawn, color: "#f59e0b" },
      { label: "Available", value: available, color: "#3b82f6" },
    ];
  }, [totals]);

  const topDonors = useMemo(() => {
    // Aggregate donations by donor (exclude anonymous)
    const map = new Map();
    (donations || []).forEach((d) => {
      if (d.isAnonymous) return;
      const key = d.donorDetails?.donorId || d.donorUserId || d.donorName;
      const name = d.donorDetails?.displayName || d.donorName || "Donor";
      const amount = Number(d.amount || 0);
      if (!key) return;
      const prev = map.get(key) || {
        name,
        total: 0,
        lastDate: d.donationDate,
        donorId: d.donorDetails?.donorId || d.donorUserId || null,
        donorType: d.donorDetails?.donorType || null,
        profilePictureUrl: d.donorDetails?.profilePictureUrl || null,
        latestCampaignName: d.campaignName || null,
        latestDonationAmount: amount,
      };
      const isMoreRecent =
        prev.lastDate && d.donationDate
          ? new Date(d.donationDate) > new Date(prev.lastDate)
          : !!d.donationDate;
      map.set(key, {
        name,
        total: prev.total + amount,
        lastDate: isMoreRecent ? d.donationDate : prev.lastDate,
        donorId: prev.donorId,
        donorType: prev.donorType,
        profilePictureUrl:
          prev.profilePictureUrl || d.donorDetails?.profilePictureUrl || null,
        latestCampaignName: isMoreRecent
          ? d.campaignName || prev.latestCampaignName
          : prev.latestCampaignName,
        latestDonationAmount: isMoreRecent ? amount : prev.latestDonationAmount,
      });
    });
    const arr = Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    return arr;
  }, [donations]);

  const recentDonors = useMemo(() => {
    const rows = (donations || [])
      .filter((d) => d)
      .sort(
        (a, b) =>
          new Date(b.donationDate).getTime() -
          new Date(a.donationDate).getTime()
      )
      .slice(0, 6);
    return rows;
  }, [donations]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-3xl font-semibold text-[color:var(--color-primary-text)]">
          Organizer Dashboard
        </h1>
        <div className="flex gap-2">
          <SecondaryButton onClick={() => navigate("/organizer/campaigns")}>
            My Campaigns
          </SecondaryButton>
          <PrimaryButton
            onClick={() => navigate("/organizer/campaigns/create")}
          >
            <span className="flex items-center gap-2">
              <FiPlusCircle /> Create Campaign
            </span>
          </PrimaryButton>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetaCard
          title="Campaigns"
          value={totals.totalCampaigns}
          Icon={FiFlag}
          color="#3b82f6"
        />
        <MetaCard
          title="Donations"
          value={totals.totalDonations}
          Icon={FiUsers}
          color="#10b981"
        />
        <MetaCard
          title="Total Raised"
          value={formatCurrency(totals.totalRaised)}
          Icon={FiTrendingUp}
          color="#8b5cf6"
        />
        <MetaCard
          title="Total Withdrawn"
          value={formatCurrency(totals.totalWithdrawn)}
          Icon={FiDownloadCloud}
          color="#f59e0b"
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
            Campaigns vs Total Raised
          </h3>
          {barChartData.length === 0 ? (
            <div className="text-[color:var(--color-secondary-text)]">
              No data to display
            </div>
          ) : (
            <div className="w-full">
              {(() => {
                const values = barChartData.map((d) => Number(d.value || 0));
                const maxVal = Math.max(...values, 0);
                if (maxVal <= 0) {
                  return (
                    <div className="h-64 flex items-center justify-center text-[color:var(--color-secondary-text)]">
                      No data to display
                    </div>
                  );
                }
                // Container height is h-64 (256px). Use pixel heights with a minimum for non-zero values
                const containerPx = 256;
                const minPx = 6;
                const axisWidthPx = 56;
                const ticks = [1, 0.75, 0.5, 0.25, 0]; // top to bottom
                return (
                  <div className="relative h-64 w-full">
                    {/* Y Axis with tick labels */}
                    <div
                      className="absolute left-0 top-0 bottom-0"
                      style={{ width: `${axisWidthPx}px` }}
                    >
                      <div className="relative h-full pr-2">
                        {ticks.map((t, i) => {
                          const y = Math.round((1 - t) * containerPx);
                          const labelVal = Math.round(maxVal * t);
                          return (
                            <div
                              key={i}
                              className="absolute left-0 right-0"
                              style={{
                                top: `${y}px`,
                                transform: "translateY(-50%)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[color:var(--color-secondary-text)] whitespace-nowrap">
                                  {formatCurrency(labelVal)}
                                </span>
                                <span className="flex-1 border-t border-[color:var(--color-muted)]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bars area */}
                    <div
                      className="absolute top-0 bottom-0 right-0 flex items-end gap-3"
                      style={{ left: `${axisWidthPx}px` }}
                    >
                      {barChartData.map((item, idx) => {
                        const value = Number(item.value || 0);
                        const scaled = Math.round(
                          (value / maxVal) * containerPx
                        );
                        const heightPx =
                          value > 0 ? Math.max(scaled, minPx) : 0;
                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center"
                          >
                            <div
                              className="w-full rounded-t"
                              style={{
                                height: `${heightPx}px`,
                                background: item.color + "aa",
                                border: `1px solid ${item.color}66`,
                              }}
                              title={`${item.label}: ${formatCurrency(
                                item.value
                              )}`}
                            />
                            <div
                              className="mt-2 text-xs text-center text-[color:var(--color-secondary-text)] truncate w-full"
                              title={item.label}
                            >
                              {item.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
            Funds Breakdown
          </h3>
          <div className="flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {(() => {
                const total = pieChart.reduce((s, p) => s + p.value, 0) || 1;
                let startAngle = 0;
                return pieChart.map((slice, i) => {
                  const angle = (slice.value / total) * Math.PI * 2;
                  const endAngle = startAngle + angle;
                  const largeArc = angle > Math.PI ? 1 : 0;
                  const r = 80;
                  const cx = 100;
                  const cy = 100;
                  const x1 = cx + r * Math.cos(startAngle);
                  const y1 = cy + r * Math.sin(startAngle);
                  const x2 = cx + r * Math.cos(endAngle);
                  const y2 = cy + r * Math.sin(endAngle);
                  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const el = (
                    <path key={i} d={d} fill={slice.color} opacity={0.9} />
                  );
                  startAngle = endAngle;
                  return el;
                });
              })()}
              {/* inner circle for donut effect */}
              <circle
                cx="100"
                cy="100"
                r="45"
                fill="var(--color-surface)"
                stroke="var(--color-muted)"
              />
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {pieChart.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded"
                  style={{ background: p.color }}
                />
                <span className="text-[color:var(--color-secondary-text)]">
                  {p.label}
                </span>
                <span className="ml-auto font-semibold text-[color:var(--color-primary-text)]">
                  {formatCurrency(p.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donors section (Recent on top, Top below) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)]">
              Recent Donors
            </h3>
            <SecondaryButton onClick={() => navigate("/donations")}>
              View My Donations
            </SecondaryButton>
          </div>
          {recentDonors.length === 0 ? (
            <div className="text-[color:var(--color-secondary-text)]">
              No donations yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentDonors.slice(0, 5).map((d, idx) => {
                const displayName = d.isAnonymous
                  ? "Anonymous"
                  : d.donorDetails?.displayName || d.donorName || "Donor";
                const profileUrl = d.isAnonymous
                  ? null
                  : d.donorDetails?.donorType === "organization"
                  ? `/organizers/${d.donorDetails?.donorId}`
                  : d.donorDetails?.donorType === "individual"
                  ? `/users/${d.donorDetails?.donorId}`
                  : null;
                const avatarUrl = d.donorDetails?.profilePictureUrl || null;
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[color:var(--color-muted)] border border-[color:var(--color-muted)] flex items-center justify-center">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-[color:var(--color-secondary-text)]">
                            {displayName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        {profileUrl ? (
                          <a
                            href={profileUrl}
                            className="text-[color:var(--color-primary-text)] font-semibold hover:underline truncate inline-block max-w-[220px]"
                          >
                            {displayName}
                          </a>
                        ) : (
                          <span className="text-[color:var(--color-primary-text)] font-semibold truncate inline-block max-w-[220px]">
                            {displayName}
                          </span>
                        )}
                        <div className="text-xs text-[color:var(--color-secondary-text)] truncate">
                          {new Date(d.donationDate).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-xs text-[color:var(--color-secondary-text)] truncate max-w-[180px]"
                        title={d.campaignName || "Campaign"}
                      >
                        {d.campaignName || "Campaign"}
                      </span>
                      <span className="font-semibold text-[color:var(--color-primary-text)]">
                        {formatCurrency(d.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Top donors below */}
          <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mt-6 mb-3">
            Top Donors
          </h3>
          {topDonors.length === 0 ? (
            <div className="text-[color:var(--color-secondary-text)]">
              No donor data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topDonors.slice(0, 5).map((d, idx) => {
                const profileUrl =
                  d.donorType === "organization"
                    ? `/organizers/${d.donorId}`
                    : d.donorType === "individual"
                    ? `/users/${d.donorId}`
                    : null;
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--color-background)] border border-[color:var(--color-muted)] flex items-center justify-center text-[10px] font-bold">
                        #{idx + 1}
                      </div>
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[color:var(--color-muted)] border border-[color:var(--color-muted)] flex items-center justify-center">
                        {d.profilePictureUrl ? (
                          <img
                            src={d.profilePictureUrl}
                            alt={d.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-[color:var(--color-secondary-text)]">
                            {d.name?.charAt(0) || "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        {profileUrl ? (
                          <a
                            href={profileUrl}
                            className="text-[color:var(--color-primary-text)] font-semibold hover:underline truncate inline-block max-w-[220px]"
                          >
                            {d.name}
                          </a>
                        ) : (
                          <span className="text-[color:var(--color-primary-text)] font-semibold truncate inline-block max-w-[220px]">
                            {d.name}
                          </span>
                        )}
                        <div
                          className="text-xs text-[color:var(--color-secondary-text)] truncate"
                          title={d.latestCampaignName || "Campaign"}
                        >
                          {d.latestCampaignName || "Campaign"}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-[color:var(--color-primary-text)]">
                      {formatCurrency(d.total)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column now reserved for campaigns (placeholder container) */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
            Campaigns
          </h3>
          <div className="text-[color:var(--color-secondary-text)]">
            Coming soon…
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6">
        <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            onClick={() => navigate("/organizer/campaigns/create")}
          >
            Create Campaign
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/feed/create")}>
            Create Post
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
