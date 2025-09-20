/**
 * CoverImage Component
 *
 * A reusable component for displaying user cover images using React Query for
 * efficient data fetching and persistent caching.
 *
 * @author FundFlow Team
 * @version 2.0.0
 */
import { useState, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMediaUrl } from "../services/usersApi";
import imageCache from "../../../utils/imageCache";

// This function can be extracted to a shared utility if used in more places
const fetchImageUrl = async (mediaId) => {
  if (!mediaId) {
    return null;
  }

  // 1. Check persistent cache first
  const cachedUrl = imageCache.get(mediaId);
  if (cachedUrl) {
    return cachedUrl;
  }

  // 2. If not in cache, fetch from API
  const response = await getMediaUrl(mediaId);
  const url = response?.url;

  if (url) {
    // 3. Store the new URL in the cache
    imageCache.set(mediaId, url);
    return url;
  }

  throw new Error("Failed to fetch image URL");
};

function CoverImage({
  mediaId,
  imageUrl,
  alt = "Cover image",
  className = "",
}) {
  const [imageLoadError, setImageLoadError] = useState(false);

  // Determine if we have a direct URL or need to fetch via mediaId
  const hasDirectUrl = !!imageUrl;
  const hasMediaId = !!mediaId;

  const {
    data: fetchedImageUrl,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["imageUrl", mediaId], // Use the same queryKey structure
    queryFn: () => fetchImageUrl(mediaId),
    enabled: hasMediaId && !hasDirectUrl,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    setImageLoadError(false);
  }, [mediaId, imageUrl]);

  // Determine the final image URL to use
  const finalImageUrl = hasDirectUrl ? imageUrl : fetchedImageUrl;

  if (hasMediaId && !hasDirectUrl && isLoading) {
    return (
      <div
        className={`w-full h-48 bg-gray-300 dark:bg-gray-700 animate-pulse ${className}`}
      />
    );
  }

  if (
    (hasMediaId && !hasDirectUrl && isError) ||
    imageLoadError ||
    !finalImageUrl
  ) {
    return (
      <div
        className={`w-full h-48 bg-[color:var(--color-muted)] ${className}`}
      />
    );
  }

  return (
    <img
      src={finalImageUrl}
      alt={alt}
      className={`w-full h-48 object-cover ${className}`}
      onError={() => setImageLoadError(true)} // Handle broken image links
    />
  );
}

export default memo(CoverImage);
