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
import ErrorState from "../../../components/ErrorState";
import { SkeletonDashboard } from "../../../components/Skeleton";

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
  const [animateGraphs, setAnimateGraphs] = useState(false);

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

  // Trigger animations on first render after data load
  useEffect(() => {
    if (!loading && !error) {
      const id = setTimeout(() => setAnimateGraphs(true), 50);
      return () => clearTimeout(id);
    }
  }, [loading, error]);

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
    return <SkeletonDashboard />;
  }
  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <ErrorState
          title="Failed to load organizer dashboard"
          description={error}
          onRetry={() => window.location.reload()}
          primaryAction={{
            to: "/organizer/campaigns/create",
            label: "Create Campaign",
          }}
          secondaryAction={{
            to: "/organizer/campaigns",
            label: "My Campaigns",
          }}
        />
      </div>
    );
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
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

                // Responsive container dimensions
                const containerHeight = 256; // h-64 equivalent
                const minBarHeight = 8;
                const axisWidth = 60;

                // Calculate available space for bars (in pixels)
                const containerWidth = 100; // percentage
                const availableSpacePx = containerWidth - axisWidth / 4; // Convert axis width to percentage

                // Dynamic gap and bar width calculation
                const numBars = barChartData.length;
                const minGap = 2; // Minimum gap in percentage
                const maxGap = 8; // Maximum gap in percentage
                const minBarWidth = 4; // Minimum bar width in percentage
                const maxBarWidth = 15; // Maximum bar width in percentage

                // Calculate optimal gap and bar width
                const totalGapSpace = Math.max(
                  minGap * (numBars - 1),
                  Math.min(maxGap * (numBars - 1), availableSpacePx * 0.1)
                );
                const availableForBars = availableSpacePx - totalGapSpace;
                const calculatedBarWidth = availableForBars / numBars;

                const barWidth = Math.max(
                  minBarWidth,
                  Math.min(maxBarWidth, calculatedBarWidth)
                );
                const barGap =
                  numBars > 1
                    ? Math.max(
                        minGap,
                        Math.min(maxGap, totalGapSpace / (numBars - 1))
                      )
                    : 0;

                const ticks = [1, 0.75, 0.5, 0.25, 0];

                return (
                  <div
                    className="relative w-full"
                    style={{ height: `${containerHeight}px` }}
                  >
                    {/* Y Axis with tick labels */}
                    <div
                      className="absolute left-0 top-0 bottom-0"
                      style={{ width: `${axisWidth}px` }}
                    >
                      <div className="relative h-full pr-2">
                        {ticks.map((t, i) => {
                          const y = Math.round((1 - t) * containerHeight);
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
                      className="absolute top-0 bottom-0 right-0 flex items-end"
                      style={{
                        left: `${axisWidth}px`,
                        gap: `${barGap}%`,
                        paddingRight: "8px",
                        width: `${100 - axisWidth / 4}%`,
                      }}
                    >
                      {barChartData.map((item, idx) => {
                        const value = Number(item.value || 0);
                        const scaled = Math.round(
                          (value / maxVal) * containerHeight
                        );
                        const heightPx =
                          value > 0 ? Math.max(scaled, minBarHeight) : 0;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center"
                            style={{
                              width: `${barWidth}%`,
                              minWidth: "4%",
                              maxWidth: "15%",
                            }}
                          >
                            <div
                              className="w-full rounded-t"
                              style={{
                                height: `${animateGraphs ? heightPx : 0}px`,
                                background: item.color + "aa",
                                border: `1px solid ${item.color}66`,
                                transition: "height 700ms ease",
                                transitionDelay: `${idx * 60}ms`,
                                maxHeight: `${containerHeight - 40}px`, // Prevent overflow
                              }}
                              title={`${item.label}: ${formatCurrency(
                                item.value
                              )}`}
                            />
                            <div
                              className="mt-2 text-[10px] text-center text-[color:var(--color-secondary-text)] truncate w-full leading-tight"
                              title={item.label}
                              style={{
                                maxWidth: `${barWidth + 2}%`,
                                fontSize:
                                  barChartData.length > 6 ? "9px" : "10px",
                              }}
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
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
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
                    <path
                      key={i}
                      d={d}
                      fill={slice.color}
                      opacity={animateGraphs ? 0.9 : 0}
                      style={{
                        transformOrigin: "100px 100px",
                        transform: animateGraphs ? "scale(1)" : "scale(0.95)",
                        transition: "opacity 600ms ease, transform 600ms ease",
                        transitionDelay: `${i * 80}ms`,
                      }}
                    />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
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

        {/* Campaigns container: table and top campaign card */}
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
            Campaigns
          </h3>
          {(() => {
            // Sort campaigns by total raised desc
            const rows = (campaigns || [])
              .map((c) => {
                const raised = Number(campaignRaisedMap[c.campaignId] || 0);
                const goal = Number(c.goalAmount || 0);
                const pct =
                  goal > 0
                    ? Math.min(100, Math.round((raised / goal) * 100))
                    : 0;
                const avatar = c.customPageSettings?.mainMedia?.url || null;
                return {
                  id: c.campaignId,
                  name: c.name || "Campaign",
                  avatar,
                  raised,
                  goal,
                  pct,
                };
              })
              .sort((a, b) => b.raised - a.raised);
            const top5 = rows.slice(0, 5);
            const top1 = rows[0];
            return (
              <>
                {/* Table */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[color:var(--color-secondary-text)] border-b border-[color:var(--color-muted)]">
                        <th className="text-left py-2 font-medium">Campaign</th>
                        <th className="text-right py-2 font-medium">Raised</th>
                        <th className="text-right py-2 font-medium">% Goal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-[color:var(--color-muted)] hover:bg-[color:var(--color-background)] cursor-pointer"
                          onClick={() => navigate(`/campaigns/${row.id}`)}
                        >
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded overflow-hidden bg-[color:var(--color-muted)] border border-[color:var(--color-muted)] flex items-center justify-center">
                                {row.avatar ? (
                                  <img
                                    src={row.avatar}
                                    alt={row.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs text-[color:var(--color-secondary-text)]">
                                    {row.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <span
                                className="text-[color:var(--color-primary-text)] font-semibold truncate max-w-[220px]"
                                title={row.name}
                              >
                                {row.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 text-right">
                            <span className="font-semibold text-[color:var(--color-primary-text)]">
                              {formatCurrency(row.raised)}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <span className="text-[color:var(--color-primary-text)]">
                              {row.pct}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Top campaign card */}
                {top1 && (
                  <div className="mt-6 border border-[color:var(--color-muted)] rounded-xl p-4 bg-[color:var(--color-background)]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-bold text-[color:var(--color-primary-text)]">
                        Top Campaign
                      </h4>
                      <SecondaryButton
                        onClick={() => navigate(`/campaigns/${top1.id}`)}
                      >
                        View
                      </SecondaryButton>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-[color:var(--color-muted)] border border-[color:var(--color-muted)] flex items-center justify-center">
                        {top1.avatar ? (
                          <img
                            src={top1.avatar}
                            alt={top1.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-[color:var(--color-secondary-text)]">
                            {top1.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-[color:var(--color-primary-text)] font-semibold truncate max-w-[260px]"
                          title={top1.name}
                        >
                          {top1.name}
                        </div>
                        <div className="text-xs text-[color:var(--color-secondary-text)]">
                          Raised {formatCurrency(top1.raised)} of{" "}
                          {formatCurrency(top1.goal)}
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-3 bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded overflow-hidden mb-3">
                      <div
                        className="h-full"
                        style={{
                          width: `${animateGraphs ? top1.pct : 0}%`,
                          background: "var(--color-primary)",
                          transition: "width 700ms ease",
                        }}
                        title={`${top1.pct}%`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded p-3">
                        <div className="text-[color:var(--color-secondary-text)]">
                          Total Raised
                        </div>
                        <div className="font-semibold text-[color:var(--color-primary-text)]">
                          {formatCurrency(top1.raised)}
                        </div>
                      </div>
                      <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded p-3">
                        <div className="text-[color:var(--color-secondary-text)]">
                          Goal
                        </div>
                        <div className="font-semibold text-[color:var(--color-primary-text)]">
                          {formatCurrency(top1.goal)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
