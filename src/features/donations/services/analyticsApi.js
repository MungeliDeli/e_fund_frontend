/**
 * Analytics API Service
 *
 * Handles all API calls to the backend analytics endpoints for campaign analytics,
 * financial metrics, donor insights, and progress tracking.
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

/**
 * Get comprehensive campaign analytics summary
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Analytics summary data
 */
export const getCampaignAnalyticsSummary = async (campaignId) => {
  const response = await apiClient.get(
    `/campaigns/${campaignId}/analytics/summary`
  );
  return response.data;
};

/**
 * Get campaign financial metrics
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Financial metrics data
 */
export const getCampaignFinancialMetrics = async (campaignId) => {
  const response = await apiClient.get(
    `/campaigns/${campaignId}/analytics/financial`
  );
  return response.data;
};

/**
 * Get campaign donor insights
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Donor insights data
 */
export const getCampaignDonorInsights = async (campaignId) => {
  const response = await apiClient.get(
    `/campaigns/${campaignId}/analytics/donors`
  );
  return response.data;
};

/**
 * Get top donors for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {number} limit - Maximum number of donors to return
 * @returns {Promise<Object>} Top donors data
 */
export const getCampaignTopDonors = async (campaignId, limit = 10) => {
  const response = await apiClient.get(
    `/campaigns/${campaignId}/analytics/top-donors`,
    {
      params: { limit },
    }
  );
  return response.data;
};

/**
 * Get campaign progress percentage
 * @param {string} campaignId - Campaign ID
 * @param {number} goalAmount - Campaign goal amount
 * @returns {Promise<Object>} Progress data
 */
export const getCampaignProgress = async (campaignId, goalAmount) => {
  const response = await apiClient.get(
    `/campaigns/${campaignId}/analytics/progress`,
    {
      params: { goalAmount },
    }
  );
  return response.data;
};
