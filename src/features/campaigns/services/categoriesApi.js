/**
 * Categories API Service
 *
 * Handles all API calls for category management operations.
 * Provides methods for CRUD operations on categories with proper error handling.
 *
 * Key Features:
 * - Category CRUD operations
 * - Statistics
 * - Error handling
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

/**
 * Get all categories (no filtering - for client-side processing)
 * @returns {Promise<Object>} All categories
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get(`/categories`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

/**
 * Get a category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Category object
 */
export const getCategoryById = async (categoryId) => {
  try {
    const response = await apiClient.get(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    throw error;
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data (name, description, isActive)
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post(`/categories`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

/**
 * Update a category by ID
 * @param {string} categoryId - Category ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (categoryId, updateData) => {
  try {
    const response = await apiClient.put(
      `/categories/${categoryId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw error;
  }
};

/**
 * Get category statistics
 * @returns {Promise<Object>} Category statistics
 */
export const getCategoryStats = async () => {
  try {
    const response = await apiClient.get(`/categories/stats`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch category stats:", error);
    throw error;
  }
};
