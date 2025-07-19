/**
 * CoverImage Component
 * 
 * A reusable component for displaying user cover images with intelligent caching,
 * loading states, and fallback handling. Similar to ProfileImage but designed
 * for rectangular cover photos with flexible height options.
 * 
 * Key Features:
 * - Automatic S3 URL fetching and caching
 * - Flexible height options (h-20, h-32, h-60, etc.)
 * - Loading states with skeleton animation
 * - Error handling with fallback icons
 * - Memoized to prevent unnecessary re-renders
 * 
 * Props:
 * @param {string} mediaId - Database media record ID
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {string} height - Height class (h-20, h-32, h-60, etc.)
 * @param {Component} fallbackIcon - Icon component to show when no image
 * @param {Function} onLoad - Callback when image loads successfully
 * @param {Function} onError - Callback when image fails to load
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { FiImage } from 'react-icons/fi';
import { getMediaUrl } from '../services/usersApi';
import imageCache from '../../../utils/imageCache';

function CoverImage({ 
  mediaId, 
  alt = "Cover", 
  className = "", 
  height = "h-32",
  fallbackIcon = FiImage,
  onLoad,
  onError 
}) {
  // State management for image loading
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Icon size mapping based on container height
  const iconSizes = {
    "h-20": "text-lg",      // 80px height -> 18px icon
    "h-24": "text-xl",      // 96px height -> 20px icon
    "h-28": "text-2xl",     // 112px height -> 24px icon
    "h-32": "text-3xl",     // 128px height -> 30px icon
    "h-36": "text-4xl",     // 144px height -> 36px icon
    "h-40": "text-5xl",     // 160px height -> 48px icon
    "h-44": "text-6xl",     // 176px height -> 60px icon
    "h-48": "text-7xl",     // 192px height -> 72px icon
    "h-52": "text-8xl",     // 208px height -> 84px icon
    "h-56": "text-9xl",     // 224px height -> 96px icon
    "h-60": "text-10xl"     // 240px height -> 108px icon
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
        console.error('Failed to load cover image:', err);
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
      <div className={`${height} w-full bg-[color:var(--color-muted)] flex items-center justify-center animate-pulse ${className}`}>
        <div className="w-8 h-8 bg-[color:var(--color-text)] rounded opacity-50"></div>
      </div>
    );
  }

  // Error state or no image - show fallback icon
  if (error || !imageUrl) {
    return (
      <div className={`${height} w-full bg-[color:var(--color-muted)] flex items-center justify-center ${className}`}>
        <FallbackIcon className={`${iconSizes[height] || 'text-3xl'} text-[color:var(--color-text)]`} />
      </div>
    );
  }

  // Success state - render the actual image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${height} w-full object-cover ${className}`}
      onError={() => setError(true)} // Handle image load errors
    />
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(CoverImage); 