import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFlag,
  FiTrendingUp,
  FiDownloadCloud,
  FiUsers,
  FiUser,
  FiShield,
} from "react-icons/fi";
import { PrimaryButton, SecondaryButton } from "../../../../components/Buttons";
import MetaCard from "../../../campaigns/components/MetaCard";
import { getAllCampaigns } from "../../../campaigns/services/campaignApi";
import { getAllDonations } from "../../../donations/services/donationsApi";
import {
  fetchAllOrganizers,
  fetchAllUsers,
  fetchAllAdmins,
} from "../../services/usersApi";
import { fetchAdminWithdrawals } from "../../../campaigns/services/adminWithdrawApi";
import ErrorState from "../../../../components/ErrorState";
import {
  generateAdminDashboardReport,
  downloadPDFReport,
} from "../../../../utils/pdfReports";

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

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [animateGraphs, setAnimateGraphs] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [campsRes, donsRes, orgsRes, usersRes, adminsRes, wdRes] =
          await Promise.all([
            getAllCampaigns({ limit: 500 }),
            getAllDonations({ limit: 1000 }),
            fetchAllOrganizers(),
            fetchAllUsers(),
            fetchAllAdmins(),
            fetchAdminWithdrawals({ status: "pending", limit: 20 }),
          ]);
        if (!mounted) return;
        setCampaigns(campsRes?.data?.data || campsRes?.data || campsRes || []);
        setDonations(donsRes?.data?.data || donsRes?.data || donsRes || []);
        setOrganizers(orgsRes?.data?.data || orgsRes?.data || orgsRes || []);
        setUsers(usersRes?.data?.data || usersRes?.data || usersRes || []);
        setAdmins(adminsRes?.data?.data || adminsRes?.data || adminsRes || []);
        setWithdrawals(wdRes?.data?.data || wdRes?.data || wdRes || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load admin dashboard");
      } finally {
        if (!mounted) return;
        setLoading(false);
        setTimeout(() => mounted && setAnimateGraphs(true), 60);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const aggregates = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === "active"
    ).length;
    const pendingApproval = campaigns.filter(
      (c) => c.status === "pendingApproval"
    ).length;

    const completedDonations = donations.filter(
      (d) => d.status === "completed"
    );
    const totalDonations = completedDonations.length;
    const totalRaised = completedDonations.reduce(
      (s, d) => s + Number(d.amount || 0),
      0
    );
    const uniqueDonors = new Set(
      completedDonations
        .filter((d) => !!d.donorUserId)
        .map((d) => d.donorUserId)
    ).size;

    const totalWithdrawn = campaigns.reduce(
      (s, c) => s + Number(c.totalWithdrawn || 0),
      0
    );

    const totalOrganizers = organizers.length;
    const totalIndividuals = users.length;
    const totalAdmins = admins.length;

    // Campaign rows with raised and pct
    const raisedPerCampaign = new Map();
    completedDonations.forEach((d) => {
      const key = d.campaignId;
      raisedPerCampaign.set(
        key,
        (raisedPerCampaign.get(key) || 0) + Number(d.amount || 0)
      );
    });

    const campaignRows = (campaigns || []).map((c) => {
      const raised =
        raisedPerCampaign.get(c.campaignId) ||
        Number(c.currentRaisedAmount || 0) ||
        0;
      const goal = Number(c.goalAmount || 0);
      const pct =
        goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
      const avatar = c.customPageSettings?.mainMedia?.url || null;
      return {
        id: c.campaignId,
        name: c.name || "Campaign",
        avatar,
        raised,
        goal,
        pct,
        status: c.status,
      };
    });
    campaignRows.sort((a, b) => b.raised - a.raised);

    // Recent donations (top 6)
    const recentDonations = [...donations]
      .filter((d) => d && d.status === "completed")
      .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate))
      .slice(0, 6);

    // Top donors (top 5)
    const donorAgg = new Map();
    completedDonations.forEach((d) => {
      if (d.isAnonymous) return;
      const key = d.donorDetails?.donorId || d.donorUserId || d.donorName;
      if (!key) return;
      const prev = donorAgg.get(key) || {
        name: d.donorDetails?.displayName || d.donorName || "Donor",
        donorId: d.donorDetails?.donorId || d.donorUserId || null,
        donorType: d.donorDetails?.donorType || null,
        profilePictureUrl: d.donorDetails?.profilePictureUrl || null,
        total: 0,
        latestCampaignName: d.campaignName || null,
      };
      donorAgg.set(key, {
        ...prev,
        total: prev.total + Number(d.amount || 0),
        latestCampaignName: d.campaignName || prev.latestCampaignName,
      });
    });
    const topDonors = Array.from(donorAgg.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Pending approvals (campaigns) and withdrawals (pending)
    const pendingCampaigns = campaignRows
      .filter((c) => c.status === "pendingApproval")
      .slice(0, 5);
    const pendingWithdrawals = (withdrawals.items || withdrawals || [])
      .filter((w) => w.status === "pending")
      .slice(0, 5);

    return {
      totalCampaigns,
      activeCampaigns,
      pendingApproval,
      totalDonations,
      totalRaised,
      totalWithdrawn,
      uniqueDonors,
      totalOrganizers,
      totalIndividuals,
      totalAdmins,
      campaignRows,
      topCampaign: campaignRows[0] || null,
      recentDonations,
      topDonors,
      pendingCampaigns,
      pendingWithdrawals,
    };
  }, [campaigns, donations, organizers, users, admins, withdrawals]);

  // Simple charts: bar + pie for each section
  const campaignBarData = useMemo(() => {
    return aggregates.campaignRows.slice(0, 8).map((c, idx) => ({
      label: c.name.slice(0, 16),
      value: c.raised,
      color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][
        idx % 6
      ],
    }));
  }, [aggregates.campaignRows]);

  const campaignPieData = useMemo(() => {
    const raised = aggregates.totalRaised || 0;
    const withdrawn = aggregates.totalWithdrawn || 0;
    const available = Math.max(raised - withdrawn, 0);
    return [
      { label: "Withdrawn", value: withdrawn, color: "#f59e0b" },
      { label: "Available", value: available, color: "#3b82f6" },
    ];
  }, [aggregates.totalRaised, aggregates.totalWithdrawn]);

  const userBarData = useMemo(() => {
    return [
      {
        label: "Organizers",
        value: aggregates.totalOrganizers,
        color: "#10b981",
      },
      {
        label: "Individuals",
        value: aggregates.totalIndividuals,
        color: "#3b82f6",
      },
      { label: "Admins", value: aggregates.totalAdmins, color: "#64748b" },
    ];
  }, [
    aggregates.totalOrganizers,
    aggregates.totalIndividuals,
    aggregates.totalAdmins,
  ]);

  const userPieData = useMemo(() => {
    const totalUsers = aggregates.totalOrganizers + aggregates.totalIndividuals;
    return [
      {
        label: "Organizers",
        value: aggregates.totalOrganizers,
        color: "#10b981",
      },
      {
        label: "Individuals",
        value: aggregates.totalIndividuals,
        color: "#3b82f6",
      },
    ].map((s) => ({
      ...s,
      value: s.value || 0,
      pct: totalUsers ? Math.round((s.value / totalUsers) * 100) : 0,
    }));
  }, [aggregates.totalOrganizers, aggregates.totalIndividuals]);

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const reportData = {
        aggregates,
        campaigns,
        donations,
        organizers,
        users,
        admins,
        withdrawals,
      };

      const doc = generateAdminDashboardReport(reportData);
      downloadPDFReport(
        doc,
        `admin-dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
      // You could add a toast notification here
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error)
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <ErrorState
          title="Failed to load admin dashboard"
          description={error}
          onRetry={() => window.location.reload()}
          primaryAction={{ to: "/admin/campaigns", label: "Open Campaigns" }}
        />
      </div>
    );

  const renderBarChart = (data) => {
    const values = data.map((d) => Number(d.value || 0));
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
    const numBars = data.length;
    const minGap = 2; // Minimum gap in percentage
    const maxGap = 8; // Maximum gap in percentage

    // Different width constraints for user breakdown vs campaign charts
    const isUserChart = data === userBarData;
    const minBarWidth = isUserChart ? 8 : 4; // Bigger bars for user chart
    const maxBarWidth = isUserChart ? 25 : 15; // Much bigger max width for user chart

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
        ? Math.max(minGap, Math.min(maxGap, totalGapSpace / (numBars - 1)))
        : 0;

    const ticks = [1, 0.75, 0.5, 0.25, 0];

    return (
      <div
        className="relative w-full"
        style={{ height: `${containerHeight + 52}px`, paddingBottom: "52px" }}
      >
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
                  style={{ top: `${y}px`, transform: "translateY(-50%)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[color:var(--color-secondary-text)] whitespace-nowrap">
                      {data === campaignBarData
                        ? formatCurrency(labelVal)
                        : labelVal}
                    </span>
                    <span className="flex-1 border-t border-[color:var(--color-muted)]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="absolute top-0 bottom-0 right-0 flex items-end"
          style={{
            left: `${axisWidth}px`,
            gap: `${barGap}%`,
            paddingRight: "8px",
            width: `${100 - axisWidth / 4}%`,
          }}
        >
          {data.map((item, idx) => {
            const value = Number(item.value || 0);
            const scaled = Math.round((value / maxVal) * containerHeight);
            const heightPx = value > 0 ? Math.max(scaled, minBarHeight) : 0;
            return (
              <div
                key={idx}
                className="flex flex-col items-center"
                style={{
                  width: `${barWidth}%`,
                  minWidth: isUserChart ? "8%" : "4%",
                  maxWidth: isUserChart ? "25%" : "15%",
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
                  title={`${item.label}: ${
                    data === campaignBarData
                      ? formatCurrency(item.value)
                      : item.value
                  }`}
                />
                <div
                  className="text-[10px] text-center text-[color:var(--color-secondary-text)] leading-tight"
                  title={item.label}
                  style={{
                    maxWidth: `${barWidth + 2}%`,
                    fontSize: data.length > 6 ? "9px" : "10px",
                    transform: "rotate(-45deg)",
                    transformOrigin: "center",
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "12px",
                    position: "relative",
                    top: "8px",
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
  };

  const renderPieChart = (data) => {
    const total = data.reduce((s, p) => s + (p.value || 0), 0) || 1;
    let startAngle = 0;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200">
        {data.map((slice, i) => {
          const angle = ((slice.value || 0) / total) * Math.PI * 2;
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
        })}
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="var(--color-surface)"
          stroke="var(--color-muted)"
        />
      </svg>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-3xl font-semibold text-[color:var(--color-primary-text)]">
          Admin Dashboard
        </h1>
        <div className="flex gap-2">
          <SecondaryButton
            onClick={handleExportPDF}
            loading={exportLoading}
            disabled={exportLoading}
          >
            Export PDF
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate("/admin/users")}>
            Manage Users
          </SecondaryButton>
          <PrimaryButton onClick={() => navigate("/admin/campaigns")}>
            View Campaigns
          </PrimaryButton>
        </div>
      </div>

      {/* SECTION: Campaigns & Donations */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
          Campaigns & Donations
        </h2>
        {/* Meta cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetaCard
            title="Campaigns"
            value={aggregates.totalCampaigns}
            Icon={FiFlag}
            color="#3b82f6"
          />
          <MetaCard
            title="Active"
            value={aggregates.activeCampaigns}
            Icon={FiTrendingUp}
            color="#10b981"
          />
          <MetaCard
            title="Pending Approval"
            value={aggregates.pendingApproval}
            Icon={FiFlag}
            color="#f59e0b"
          />
          <MetaCard
            title="Donations"
            value={aggregates.totalDonations}
            Icon={FiUsers}
            color="#8b5cf6"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetaCard
            title="Raised"
            value={formatCurrency(aggregates.totalRaised)}
            Icon={FiTrendingUp}
            color="#06b6d4"
          />
          <MetaCard
            title="Withdrawn"
            value={formatCurrency(aggregates.totalWithdrawn)}
            Icon={FiDownloadCloud}
            color="#f43f5e"
          />
          <MetaCard
            title="Unique Donors"
            value={aggregates.uniqueDonors}
            Icon={FiUser}
            color="#a855f7"
          />
          <MetaCard
            title="Admins"
            value={aggregates.totalAdmins}
            Icon={FiShield}
            color="#64748b"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="xl:col-span-2 bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
              Campaigns vs Total Raised
            </h3>
            {renderBarChart(campaignBarData)}
          </div>
          <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
              Funds Breakdown
            </h3>
            <div className="flex items-center justify-center">
              {renderPieChart(campaignPieData)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {campaignPieData.map((p, idx) => (
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

        {/* Donations + Campaigns panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Donations (recent + top donors) */}
          <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
              Recent Donations
            </h3>
            {aggregates.recentDonations.length === 0 ? (
              <div className="text-[color:var(--color-secondary-text)]">
                No donations
              </div>
            ) : (
              <div className="space-y-3">
                {aggregates.recentDonations.slice(0, 5).map((d, idx) => {
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
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
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

            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mt-6 mb-3">
              Top Donors
            </h3>
            {aggregates.topDonors.length === 0 ? (
              <div className="text-[color:var(--color-secondary-text)]">
                No donor data
              </div>
            ) : (
              <div className="space-y-3">
                {aggregates.topDonors.map((d, idx) => {
                  const profileUrl =
                    d.donorType === "organization"
                      ? `/organizers/${d.donorId}`
                      : d.donorType === "individual"
                      ? `/users/${d.donorId}`
                      : null;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
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

          {/* Campaigns (table + top campaign) */}
          <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
              Campaigns
            </h3>
            {(() => {
              const top5 = aggregates.campaignRows.slice(0, 5);
              const top1 = aggregates.topCampaign;
              return (
                <>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[color:var(--color-secondary-text)] border-b border-[color:var(--color-muted)]">
                          <th className="text-left py-2 font-medium">
                            Campaign
                          </th>
                          <th className="text-right py-2 font-medium">
                            Raised
                          </th>
                          <th className="text-right py-2 font-medium">
                            % Goal
                          </th>
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

      {/* SECTION: Users */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
          Users
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetaCard
            title="Organizers"
            value={aggregates.totalOrganizers}
            Icon={FiUsers}
            color="#10b981"
          />
          <MetaCard
            title="Individuals"
            value={aggregates.totalIndividuals}
            Icon={FiUsers}
            color="#3b82f6"
          />
          <MetaCard
            title="Admins"
            value={aggregates.totalAdmins}
            Icon={FiShield}
            color="#64748b"
          />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="xl:col-span-2 bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
              User Breakdown
            </h3>
            {renderBarChart(userBarData)}
          </div>
          <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
              Users Mix
            </h3>
            <div className="flex items-center justify-center">
              {renderPieChart(userPieData)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {userPieData.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ background: p.color }}
                  />
                  <span className="text-[color:var(--color-secondary-text)]">
                    {p.label}
                  </span>
                  <span className="ml-auto font-semibold text-[color:var(--color-primary-text)]">
                    {p.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Management (Pending Approvals) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
            Pending Campaign Approvals
          </h3>
          {aggregates.pendingCampaigns.length === 0 ? (
            <div className="text-[color:var(--color-secondary-text)]">
              No pending campaigns
            </div>
          ) : (
            <div className="space-y-2">
              {aggregates.pendingCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div
                    className="truncate text-[color:var(--color-primary-text)]"
                    title={c.name}
                  >
                    {c.name}
                  </div>
                  <SecondaryButton
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                  >
                    Review
                  </SecondaryButton>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-4">
            Pending Withdrawal Requests
          </h3>
          {aggregates.pendingWithdrawals.length === 0 ? (
            <div className="text-[color:var(--color-secondary-text)]">
              No pending withdrawals
            </div>
          ) : (
            <div className="space-y-2">
              {aggregates.pendingWithdrawals.map((w) => (
                <div
                  key={w.withdrawalRequestId || w.id}
                  className="flex items-center justify-between"
                >
                  <div
                    className="truncate text-[color:var(--color-primary-text)]"
                    title={w.campaignId}
                  >
                    {w.campaignId}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[color:var(--color-secondary-text)]">
                      {formatCurrency(w.amount)}
                    </span>
                    <SecondaryButton
                      onClick={() => navigate(`/admin/withdrawals`)}
                    >
                      Review
                    </SecondaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
