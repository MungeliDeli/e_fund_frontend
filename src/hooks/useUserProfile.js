/**
 * useUserProfile Hook
 *
 * A custom hook that fetches user profile data based on the user's type.
 * Handles both individual users and organization users with appropriate API calls.
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchPrivateProfile,
  fetchPrivateOrganizationProfile,
} from "../features/users/services/usersApi";

/**
 * Custom hook to fetch user profile data based on userType
 * @param {Object} user - The user object from AuthContext
 * @returns {Object} Profile data, loading state, and error state
 */
export const useUserProfile = (user) => {
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile", user?.userId, user?.userType],
    queryFn: async () => {
      if (!user?.userType) {
        return null;
      }

      // Fetch profile based on user type
      if (user.userType === "organizationUser") {
        const res = await fetchPrivateOrganizationProfile();
        return res?.data || res;
      } else {
        // For individual users and admins
        const res = await fetchPrivateProfile();
        return res?.data || res;
      }
    },
    enabled: !!user?.userId && !!user?.userType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    profile,
    isLoading,
    isError,
    error,
  };
};

export default useUserProfile;
