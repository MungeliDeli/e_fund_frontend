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
