import apiClient from "../../../../../services/apiClient";

export const fetchAuditLogs = async ({
  page = 1,
  limit = 50,
  search = "",
  actionType,
  entityType,
  sortBy = "timestamp",
  sortOrder = "desc",
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (search) params.append("search", search);
  if (actionType) params.append("actionType", actionType);
  if (entityType) params.append("entityType", entityType);
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

  const url = `/audit/logs${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await apiClient.get(url);
  // Backend ResponseFactory returns { data: { logs, pagination } }
  const { data } = res.data || {};
  return (
    data || { logs: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  );
};
