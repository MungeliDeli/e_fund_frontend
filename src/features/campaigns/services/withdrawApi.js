import apiClient from "../../../services/apiClient";

export async function requestWithdrawal({
  campaignId,
  amount,
  currency = "ZMW",
  phoneNumber,
  network,
}) {
  const payload = {
    campaignId,
    amount,
    currency,
    destinationType: "mobile_money",
    destination: { phoneNumber, network },
  };
  const res = await apiClient.post("/withdrawals", payload);
  return res.data?.data || res.data || res;
}

export async function getMyWithdrawals({ campaignId } = {}) {
  const params = new URLSearchParams();
  if (campaignId) params.set("campaignId", campaignId);
  const res = await apiClient.get(`/withdrawals?${params.toString()}`);
  return res.data?.data || res.data || res;
}
