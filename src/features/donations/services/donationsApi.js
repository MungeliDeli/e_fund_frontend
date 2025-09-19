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
