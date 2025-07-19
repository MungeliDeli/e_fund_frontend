/**
 * Image Cache Utility
 * 
 * This module provides an in-memory caching system for S3 signed URLs to improve
 * performance and reduce API calls when displaying the same images multiple times.
 * 
 * Key Features:
 * - Automatic cache expiry based on S3 URL expiration
 * - Memory-efficient storage with automatic cleanup
 * - Prevents redundant API calls for the same media IDs
 * - Thread-safe operations for concurrent access
 * 
 * Cache Strategy:
 * - URLs are cached with their S3 expiration time
 * - Automatic cleanup every 5 minutes removes expired entries
 * - Cache is cleared when URLs expire to prevent stale data
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

/**
 * In-memory cache class for storing image URLs with expiration times
 */
class ImageCache {
  constructor() {
    // Map to store mediaId -> URL mappings
    this.cache = new Map();
    // Map to store mediaId -> expiration timestamp mappings
    this.expiryTimes = new Map();
  }

  /**
   * Store a URL in the cache with its expiration time
   * 
   * @param {string} mediaId - Unique identifier for the media file
   * @param {string} url - Signed S3 URL for the image
   * @param {string|Date} expiresAt - ISO string or Date object when URL expires
   */
  set(mediaId, url, expiresAt) {
    this.cache.set(mediaId, url);
    // Convert to timestamp for easier comparison
    this.expiryTimes.set(mediaId, new Date(expiresAt).getTime());
  }

  /**
   * Retrieve a cached URL if it exists and hasn't expired
   * 
   * @param {string} mediaId - Unique identifier for the media file
   * @returns {string|null} Cached URL if valid, null if expired or not found
   */
  get(mediaId) {
    const url = this.cache.get(mediaId);
    const expiryTime = this.expiryTimes.get(mediaId);
    
    // Return null if no URL or expiry time exists
    if (!url || !expiryTime) {
      return null;
    }

    // Check if the URL has expired
    if (Date.now() > expiryTime) {
      // Clean up expired entry
      this.delete(mediaId);
      return null;
    }

    return url;
  }

  /**
   * Remove a specific item from the cache
   * 
   * @param {string} mediaId - Unique identifier for the media file
   */
  delete(mediaId) {
    this.cache.delete(mediaId);
    this.expiryTimes.delete(mediaId);
  }

  /**
   * Remove all expired items from the cache
   * This is called automatically every 5 minutes to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    for (const [mediaId, expiryTime] of this.expiryTimes.entries()) {
      if (now > expiryTime) {
        this.delete(mediaId);
      }
    }
  }

  /**
   * Clear all cached data
   * Useful for testing or when user logs out
   */
  clear() {
    this.cache.clear();
    this.expiryTimes.clear();
  }
}

// Create a global singleton instance
const imageCache = new ImageCache();

/**
 * Automatic cleanup interval
 * Runs every 5 minutes to remove expired cache entries and prevent memory leaks
 */
setInterval(() => {
  imageCache.cleanup();
}, 5 * 60 * 1000); // 5 minutes in milliseconds

export default imageCache; 