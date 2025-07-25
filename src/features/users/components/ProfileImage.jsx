/**
 * ProfileImage Component
 * 
 * A reusable component for displaying user profile images using React Query for
 * efficient data fetching and persistent caching.
 * 
 * @author FundFlow Team
 * @version 2.0.0
 */
import {useEffect ,useState,memo} from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUser } from 'react-icons/fi';
import { getMediaUrl } from '../services/usersApi';
import imageCache from '../../../utils/imageCache';

// The query function to be used with useQuery
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

  // Throw an error if the URL couldn't be fetched
  throw new Error('Failed to fetch image URL');
};

function ProfileImage({
  mediaId,
  alt = "Profile",
  className = "",
  size = "md",
  fallbackIcon: FallbackIcon = FiUser
}) {
  // State management for image load error (for the <img onError> tag)
  const [imageLoadError, setImageLoadError] = useState(false);

  // Size configuration mapping for consistent styling
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32"
  };

  // Icon size mapping to match container sizes
  const iconSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
    "2xl": "text-5xl"
  };

  const {
    data: imageUrl,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['imageUrl', mediaId],
    queryFn: () => fetchImageUrl(mediaId),
    enabled: !!mediaId,
    staleTime: Infinity, // URLs are permanent, no need to refetch
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on failure, just show fallback
  });

  // Reset image load error state when mediaId changes
  useEffect(() => {
    setImageLoadError(false);
  }, [mediaId]);

  // Loading state with skeleton animation
  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center animate-pulse ${className}`}>
      </div>
    );
  }

  // Error state or no image - show fallback icon
  if (isError || imageLoadError || !imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-[color:var(--color-muted)] flex items-center justify-center ${className}`}>
        <FallbackIcon className={`${iconSizes[size]} text-white `} />
      </div>
    );
  }

  // Success state - render the actual image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={() => setImageLoadError(true)} // Handle broken image links
    />
  );
}

export default memo(ProfileImage);