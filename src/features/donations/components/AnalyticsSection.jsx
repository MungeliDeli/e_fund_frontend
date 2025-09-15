import React, { useEffect, useState } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiBarChart,
} from "react-icons/fi";
import MetaCard from "../../campaigns/components/MetaCard";
import ColoredIcon from "../../../components/ColoredIcon";
import ProgressBar from "./ProgressBar";
import DonorInsights from "./DonorInsights";
import TopDonors from "./TopDonors";
import {
  getCampaignFinancialMetrics,
  getCampaignDonorInsights,
  getCampaignTopDonors,
  getCampaignProgress,
} from "../services/analyticsApi";
import Notification from "../../../components/Notification";

/**
 * AnalyticsSection Component
 *
 * Main analytics section that displays campaign financial metrics, progress,
 * donor insights, and top donors. Handles data fetching and loading states.
 *
 * @param {Object} props
 * @param {string} props.campaignId - Campaign ID
 * @param {number} props.goalAmount - Campaign goal amount
 * @param {string} props.className - Additional CSS classes
 */
function AnalyticsSection({ campaignId, goalAmount, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    financial: null,
    donorInsights: null,
    topDonors: null,
    progress: null,
  });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      if (!campaignId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch all analytics data in parallel
        const [financial, donorInsights, topDonors, progress] =
          await Promise.all([
            getCampaignFinancialMetrics(campaignId),
            getCampaignDonorInsights(campaignId),
            getCampaignTopDonors(campaignId, 10),
            goalAmount ? getCampaignProgress(campaignId, goalAmount) : null,
          ]);

        if (mounted) {
          setAnalyticsData({
            financial: financial.data || financial,
            donorInsights: donorInsights.data || donorInsights,
            topDonors: topDonors.data || topDonors,
            progress: progress?.data || progress,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load analytics data");
          setToastMessage("Failed to load analytics data");
          setToastType("error");
          setToastVisible(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      mounted = false;
    };
  }, [campaignId, goalAmount]);

  if (loading) {
    return (
      <div
        className={`bg-[color:var(--color-surface)] rounded-xl shadow p-6 border border-[color:var(--color-muted)] ${className}`}
      >
        <div className="text-center text-[color:var(--color-secondary-text)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-accent)] mx-auto mb-2"></div>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-[color:var(--color-surface)] rounded-xl shadow p-6 border border-[color:var(--color-muted)] ${className}`}
      >
        <div className="text-center text-red-500">
          <FiBarChart className="text-2xl mx-auto mb-2" />
          <p className="font-medium">Failed to load analytics</p>
          <p className="text-sm text-[color:var(--color-secondary-text)]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const { financial, donorInsights, topDonors, progress } = analyticsData;

  return (
    <>
      <Notification
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={4000}
      />

      <div className={className}>
        {/* Analytics Header */}
        <div className="mb-6">
          <h2 className="text-2 xl font-semibold text-[color:var(--color-primary-text)] mb-2">
            Campaign Analytics
          </h2>
          <p className="text-[color:var(--color-secondary-text)]">
            Real-time insights into your campaign's performance and donor
            engagement
          </p>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-4 border border-[color:var(--color-muted)]">
            <ColoredIcon Icon={FiDollarSign} color="#10b981" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[color:var(--color-secondary-text)]">
                Total Raised
              </span>
              <span className="text-xl font-semibold text-[color:var(--color-primary-text)]">
                {financial?.totalRaised
                  ? `K${financial.totalRaised.toLocaleString()}`
                  : "K0"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-4 border border-[color:var(--color-muted)]">
            <ColoredIcon Icon={FiTrendingUp} color="#3b82f6" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[color:var(--color-secondary-text)]">
                Average Donation
              </span>
              <span className="text-xl font-semibold text-[color:var(--color-primary-text)]">
                {financial?.averageDonation
                  ? `K${financial.averageDonation.toFixed(2)}`
                  : "K0"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-4 border border-[color:var(--color-muted)]">
            <ColoredIcon Icon={FiTrendingUp} color="#8b5cf6" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[color:var(--color-secondary-text)]">
                Largest Donation
              </span>
              <span className="text-xl font-semibold text-[color:var(--color-primary-text)]">
                {financial?.largestDonation
                  ? `K${financial.largestDonation.toLocaleString()}`
                  : "K0"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[color:var(--color-surface)] rounded-xl shadow p-4 border border-[color:var(--color-muted)]">
            <ColoredIcon Icon={FiUsers} color="#f59e0b" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[color:var(--color-secondary-text)]">
                Total Donations
              </span>
              <span className="text-xl font-semibold text-[color:var(--color-primary-text)]">
                {financial?.totalDonations || "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar and Donor Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {progress && (
            <ProgressBar
              percentage={progress.percentage}
              currentAmount={progress.totalRaised}
              goalAmount={progress.goalAmount}
            />
          )}
          <DonorInsights donorInsights={donorInsights} />
        </div>

        {/* Top Donors */}
        <TopDonors topDonors={topDonors?.donors || topDonors} />
      </div>
    </>
  );
}

export default AnalyticsSection;
