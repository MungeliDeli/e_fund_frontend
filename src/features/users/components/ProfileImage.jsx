/**
 * ProfileImage Component
 * 
 * A reusable component for displaying user profile images with intelligent caching,
 * loading states, and fallback handling. This component fetches signed S3 URLs
 * for media IDs and caches them to improve performance.
 * 
 * Key Features:
 * - Automatic S3 URL fetching and caching
 * - Multiple size options (sm, md, lg, xl, 2xl)
 * - Loading states with skeleton animation
 * - Error handling with fallback icons
 * - Memoized to prevent unnecessary re-renders
 * 
 * Props:
 * @param {string} mediaId - Database media record ID
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {string} size - Size variant (sm, md, lg, xl, 2xl)
 * @param {Component} fallbackIcon - Icon component to show when no image
 * @param {Function} onLoad - Callback when image loads successfully
 * @param {Function} onError - Callback when image fails to load
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { getMediaUrl } from '../services/usersApi';
import imageCache from '../../../utils/imageCache';

function ProfileImage({ 
  mediaId, 
  alt = "Profile", 
  className = "", 
  size = "md",
  fallbackIcon = FiUser,
  onLoad,
  onError 
}) {
  // State management for image loading
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // Size configuration mapping for consistent styling
  const sizeClasses = {
    sm: "w-8 h-8",      // 32x32px
    md: "w-12 h-12",    // 48x48px
    lg: "w-16 h-16",    // 64x64px
    xl: "w-24 h-24",    // 96x96px
    "2xl": "w-32 h-32"  // 128x128px
  };

  // Icon size mapping to match container sizes
  const iconSizes = {
    sm: "text-lg",      // 18px
    md: "text-xl",      // 20px
    lg: "text-2xl",     // 24px
    xl: "text-4xl",     // 36px
    "2xl": "text-5xl"   // 48px
  };

  /**
   * Effect to handle image URL fetching and caching
   * Runs when mediaId changes or component mounts
   */
  useEffect(() => {
    // Reset state if no mediaId provided
    if (!mediaId) {
      setImageUrl(null);
      setError(false);
      return;
    }

    // Check cache first to avoid unnecessary API calls
    const cachedUrl = imageCache.get(mediaId);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      return;
    }

    /**
     * Fetch signed URL from backend and cache it
     */
    const fetchImageUrl = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await getMediaUrl(mediaId);
        const url = response.data.url;
        setImageUrl(url);
        
        // Cache the URL with its expiration time
        imageCache.set(mediaId, url, response.data.expiresAt);
        
        // Call onLoad callback if provided
        if (onLoad) onLoad(response.data);
      } catch (err) {
        console.error('Failed to load profile image:', err);
        setError(true);
        // Call onError callback if provided
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [mediaId, onLoad, onError]);

  // Get the fallback icon component
  const FallbackIcon = fallbackIcon;

  // Loading state with skeleton animation
  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-[color:var(--color-muted)] flex items-center justify-center animate-pulse ${className}`}>
        <div className="w-4 h-4 bg-[color:var(--color-text)] rounded-full opacity-50"></div>
      </div>
    );
  }

  // Error state or no image - show fallback icon
  if (error || !imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-[color:var(--color-muted)] flex items-center justify-center ${className}`}>
        <FallbackIcon className={`${iconSizes[size]} text-[color:var(--color-text)]`} />
      </div>
    );
  }

  // Success state - render the actual image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={() => setError(true)} // Handle image load errors
    />
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(ProfileImage); 