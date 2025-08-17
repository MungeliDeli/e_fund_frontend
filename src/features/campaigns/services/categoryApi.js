import apiClient from "../../../services/apiClient";

/**
 * Get all categories
 * @returns {Promise} API response with categories
 */
export const getCategories = async () => {
    return apiClient.get("/categories");
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise} API response with category details
 */
export const getCategoryById = async (categoryId) => {
    return apiClient.get(`/categories/${categoryId}`);
};

/**
 * Create new category (admin only)
 * @param {Object} categoryData - Category data
 * @returns {Promise} API response
 */
export const createCategory = async (categoryData) => {
    return apiClient.post("/categories", categoryData);
};

/**
 * Update category (admin only)
 * @param {string} categoryId - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise} API response
 */
export const updateCategory = async (categoryId, categoryData) => {
    return apiClient.put(`/categories/${categoryId}`, categoryData);
};

/**
 * Delete category (admin only)
 * @param {string} categoryId - Category ID
 * @returns {Promise} API response
 */
export const deleteCategory = async (categoryId) => {
    return apiClient.delete(`/categories/${categoryId}`);
};