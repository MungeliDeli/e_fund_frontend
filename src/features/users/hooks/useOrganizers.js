import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Fetch organizers with optional filters.
 * @param {Object} filters - { verified, active }
 */
const fetchOrganizers = async (filters = {}) => {
  const params = {};
  if (filters.verified) params.verified = filters.verified;
  if (filters.active) params.active = filters.active;
  const res = await axios.get('/api/users/organizers', { params });
  // API returns { success, message, data }
  return res.data.data || [];
};

export function useOrganizers(filters) {
  return useQuery({
    queryKey: ['organizers', filters],
    queryFn: () => fetchOrganizers(filters),
    keepPreviousData: true,
  });
}
