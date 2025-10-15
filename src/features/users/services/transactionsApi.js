/**
 * Transactions API Service
 *
 * This module provides all API calls related to transaction management for admin users.
 * It handles fetching transactions with advanced filtering, sorting, and pagination.
 *
 * Key Features:
 * - Admin transaction listing with filters
 * - Campaign dropdown data for filtering
 * - Advanced search and sorting capabilities
 * - Automatic token injection for authenticated requests
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

/**
 * Fetch transactions for admin with optional filters
 * @param {Object} filters - { page, limit, search, campaignId, status, sortBy, sortOrder }
 * @returns {Promise<Object>} Transactions data with pagination
 */
export const fetchAdminTransactions = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.search) params.append("search", filters.search);
  if (filters.campaignId) params.append("campaignId", filters.campaignId);
  if (filters.status) params.append("status", filters.status);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  const url = `/transactions/admin${
    params.toString() ? "?" + params.toString() : ""
  }`;

  const res = await apiClient.get(url);
  const pagination = res.data?.meta?.pagination || {
    page: Number(filters.page) || 1,
    limit: Number(filters.limit) || 50,
    total: 0,
    totalPages: 0,
  };
  return {
    transactions: res.data?.data || [],
    pagination,
  };
};

/**
 * Fetch campaigns for dropdown filtering
 */
export const fetchCampaignsForFilter = async () => {
  const res = await apiClient.get("/campaigns/all");
  return (res.data?.data || []).map((campaign) => ({
    categoryId: campaign.campaignId,
    name: campaign.name, // ensure proper label
  }));
};
