import apiClient from "../../../services/apiClient";

export async function getDonationsByCampaign(
  campaignId,
  { limit = 100, offset = 0 } = {}
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await apiClient.get(
    `/donations/campaign/${campaignId}?${params.toString()}`
  );
  return response;
}

export async function getDonationsByOrganizer(
  organizerId,
  { limit = 100, offset = 0 } = {}
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await apiClient.get(
    `/donations/organizer/${organizerId}?${params.toString()}`
  );
  return response;
}

export async function getAllDonations({ limit = 100, offset = 0 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await apiClient.get(`/donations?${params.toString()}`);
  return response;
}

/**
 * Get donation statistics for a specific campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Donation statistics
 */
export async function getDonationStats(campaignId) {
  const response = await apiClient.get(
    `/donations/campaign/${campaignId}/stats`
  );
  return response.data.data;
}

/**
 * Get donation status for polling
 * @param {string} donationId - Donation ID
 * @returns {Promise<{status: string, updatedAt: string}>}
 */
export async function getDonationStatus(donationId) {
  const response = await apiClient.get(`/donations/${donationId}/status`);
  // Backend uses ResponseFactory; unwrap common shapes
  const data = response?.data?.data || response?.data || {};
  return {
    status: data.status,
    updatedAt: data.updatedAt,
  };
}

/**
 * Get transaction status for polling (alternative)
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<{status: string, updatedAt: string}>}
 */
export async function getTransactionStatus(transactionId) {
  const response = await apiClient.get(`/transactions/${transactionId}/status`);
  const data = response?.data?.data || response?.data || {};
  return {
    status: data.status,
    updatedAt: data.updatedAt,
  };
}
