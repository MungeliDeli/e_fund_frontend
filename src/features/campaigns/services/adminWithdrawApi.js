/**
 * Admin Withdrawal API Service
 *
 * This module provides API calls for admin withdrawal management.
 * It handles listing, filtering, and managing withdrawal requests.
 *
 * Key Features:
 * - Admin withdrawal listing with filters
 * - Campaign and organizer data fetching for dropdowns
 * - Withdrawal approval/rejection actions
 * - Pagination support
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

/**
 * Fetch all withdrawal requests for admin with filters
 * @param {Object} filters - { status, campaignId, organizerId, page, limit }
 * @returns {Promise<Object>} Withdrawal requests with pagination
 *
 * @example
 * const withdrawals = await fetchAdminWithdrawals({ status: 'pending', page: 1, limit: 30 });
 */
export const fetchAdminWithdrawals = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.campaignId) params.append("campaignId", filters.campaignId);
  if (filters.organizerId) params.append("organizerId", filters.organizerId);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.search) params.append("search", filters.search);

  const url = `/withdrawals/admin${
    params.toString() ? "?" + params.toString() : ""
  }`;
  const res = await apiClient.get(url);
  return res.data;
};

/**
 * Approve a withdrawal request
 * @param {string} withdrawalRequestId - The ID of the withdrawal request
 * @param {string} notes - Optional approval notes
 * @returns {Promise<Object>} Updated withdrawal request
 *
 * @example
 * await approveWithdrawal('withdrawal-123', 'Approved after verification');
 */
export const approveWithdrawal = async (withdrawalRequestId, notes = "") => {
  const res = await apiClient.post(
    `/withdrawals/admin/${withdrawalRequestId}/approve`,
    {
      notes,
    }
  );
  return res.data;
};

/**
 * Reject a withdrawal request
 * @param {string} withdrawalRequestId - The ID of the withdrawal request
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated withdrawal request
 *
 * @example
 * await rejectWithdrawal('withdrawal-123', 'Insufficient documentation');
 */
export const rejectWithdrawal = async (withdrawalRequestId, reason) => {
  const res = await apiClient.post(
    `/withdrawals/admin/${withdrawalRequestId}/reject`,
    {
      reason,
    }
  );
  return res.data;
};

/**
 * Initiate manual payout for a withdrawal request
 * @param {string} withdrawalRequestId - The ID of the withdrawal request
 * @returns {Promise<Object>} Payout initiation result
 *
 * @example
 * await initiatePayout('withdrawal-123');
 */
export const initiatePayout = async (withdrawalRequestId) => {
  const res = await apiClient.post(
    `/withdrawals/admin/${withdrawalRequestId}/initiate-payout`
  );
  return res.data;
};

/**
 * Mark withdrawal as paid
 * @param {string} withdrawalRequestId - The ID of the withdrawal request
 * @returns {Promise<Object>} Updated withdrawal request
 *
 * @example
 * await markPaid('withdrawal-123');
 */
export const markPaid = async (withdrawalRequestId) => {
  const res = await apiClient.post(
    `/withdrawals/admin/${withdrawalRequestId}/mark-paid`
  );
  return res.data;
};

/**
 * Mark withdrawal as failed
 * @param {string} withdrawalRequestId - The ID of the withdrawal request
 * @param {string} reason - Failure reason
 * @returns {Promise<Object>} Updated withdrawal request
 *
 * @example
 * await markFailed('withdrawal-123', 'Payment provider error');
 */
export const markFailed = async (withdrawalRequestId, reason) => {
  const res = await apiClient.post(
    `/withdrawals/admin/${withdrawalRequestId}/mark-failed`,
    {
      reason,
    }
  );
  return res.data;
};
