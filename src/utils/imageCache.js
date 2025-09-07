/**
 * Image Cache Utility
 *
 * This module provides a persistent caching system for image URLs using localStorage
 * to improve performance and reduce API calls.
 *
 * Key Features:
 * - Persistent storage across page reloads.
 * - Simple API for getting, setting, and clearing cached URLs.
 *
 * @author FundFlow Team
 * @version 2.0.0
 */

/**
 * Persistent cache class for storing image URLs in localStorage.
 */
class ImageCache {
  constructor() {
    this.key = 'fundflow_image_cache';
  }

  /**
   * Retrieve the entire cache from localStorage.
   * @returns {Object} The parsed cache object.
   */
  _getCache() {
    try {
      const cachedData = localStorage.getItem(this.key);
      return cachedData ? JSON.parse(cachedData) : {};
    } catch (error) {
      console.error('Failed to read from localStorage cache:', error);
      return {};
    }
  }

  /**
   * Save the entire cache to localStorage.
   * @param {Object} cache - The cache object to save.
   */
  _saveCache(cache) {
    try {
      localStorage.setItem(this.key, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save to localStorage cache:', error);
    }
  }

  /**
   * Store a URL in the cache.
   * @param {string} mediaId - Unique identifier for the media file.
   * @param {string} url - The public URL for the image.
   */
  set(mediaId, url) {
    if (!mediaId || !url) return;
    const cache = this._getCache();
    cache[mediaId] = url;
    this._saveCache(cache);
  }

  /**
   * Retrieve a URL from the cache.
   * @param {string} mediaId - Unique identifier for the media file.
   * @returns {string|null} - Cached URL or null if not found.
   */
  get(mediaId) {
    if (!mediaId) return null;
    const cache = this._getCache();
    return cache[mediaId] || null;
  }

  /**
   * Remove a specific entry from the cache.
   * @param {string} mediaId - Unique identifier for the media file.
   */
  clear(mediaId) {
    if (!mediaId) return;
    const cache = this._getCache();
    delete cache[mediaId];
    this._saveCache(cache);
  }

  /**
   * Clear the entire cache.
   */
  clearAll() {
    localStorage.removeItem(this.key);
  }
}

// Create a global singleton instance
const imageCache = new ImageCache();

export default imageCache;