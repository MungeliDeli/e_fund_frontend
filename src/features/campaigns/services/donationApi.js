/**
 * Donation API Service
 *
 * Handles all donation-related API calls including creating donations,
 * validation, and donation management.
 *
 * Key Features:
 * - Donation creation and processing
 * - Client-side validation before API calls
 * - Error handling and response formatting
 * - Integration with backend donation endpoints
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import apiClient from "../../../services/apiClient";

/**
 * Create a new donation
 * @param {Object} donationData - Donation data
 * @returns {Promise<Object>} Created donation response
 */
export const createDonation = async (donationData) => {
  try {
    // Validate required fields before sending to backend
    if (!donationData.campaignId) {
      throw new Error("Campaign ID is required");
    }
    if (!donationData.amount || donationData.amount <= 0) {
      throw new Error("Valid donation amount is required");
    }
    if (!donationData.phoneNumber) {
      throw new Error("Phone number is required");
    }
    if (!donationData.gatewayUsed) {
      throw new Error("Payment method is required");
    }

    // Format the donation data for backend
    const formattedData = {
      campaignId: donationData.campaignId,
      amount: parseFloat(donationData.amount),
      currency: donationData.currency || "ZMW",
      isAnonymous: donationData.isAnonymous || false,
      phoneNumber: donationData.phoneNumber,
      paymentMethod: donationData.gatewayUsed,
      gatewayTransactionId: donationData.gatewayTransactionId,
      messageText: donationData.messageText?.trim() || undefined,
      subscribeToCampaign: donationData.subscribeToCampaign || true,
      // Optional outreach attribution
      linkTokenId: donationData.linkTokenId,
      contactId: donationData.contactId,
    };

    const response = await apiClient.post("/donations", formattedData);
    return response.data;
  } catch (error) {
    console.error("Donation API error:", error);

    // Handle specific API errors
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Handle validation errors from backend
    if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        throw new Error(validationErrors[0].message || validationErrors[0]);
      }
    }

    throw error;
  }
};

/**
 * Get donation by ID
 * @param {string} donationId - Donation ID
 * @returns {Promise<Object>} Donation details
 */
export const getDonationById = async (donationId) => {
  try {
    const response = await apiClient.get(`/donations/${donationId}`);
    return response.data;
  } catch (error) {
    console.error("Get donation error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch donation"
    );
  }
};

/**
 * Get donations for a specific campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<Object>} Donations list
 */
export const getDonationsByCampaign = async (campaignId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);

    const response = await apiClient.get(
      `/donations/campaign/${campaignId}?${params}`
    );
    return response.data;
  } catch (error) {
    console.error("Get campaign donations error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch campaign donations"
    );
  }
};

/**
 * Get user's donations
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<Object>} User donations list
 */
export const getUserDonations = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);

    const response = await apiClient.get(`/donations/user?${params}`);
    return response.data;
  } catch (error) {
    console.error("Get user donations error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch user donations"
    );
  }
};

/**
 * Validate donation data on client side
 * @param {Object} donationData - Donation data to validate
 * @returns {Object} Validation result with errors if any
 */
export const validateDonationData = (donationData) => {
  const errors = {};

  // Validate amount
  const amount = parseFloat(donationData.amount);
  if (!donationData.amount || isNaN(amount)) {
    errors.amount = "Amount must be a valid number";
  } else if (amount <= 0) {
    errors.amount = "Amount must be greater than 0";
  } else if (amount < 0.01) {
    errors.amount = "Amount must be at least K0.01";
  } else if (amount > 999999.99) {
    errors.amount = "Amount cannot exceed K999,999.99";
  }

  // Validate phone number
  if (!donationData.phoneNumber || !donationData.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else {
    const cleanPhone = donationData.phoneNumber.trim();
    // Check if phone number is in international format (+260 prefix)
    if (cleanPhone.startsWith("+260")) {
      // Remove +260 prefix for validation
      const localNumber = cleanPhone.substring(4);
      // Validate based on payment method if available
      if (donationData.paymentMethod === "airtel_money") {
        const airtelRegex = /^(097|077)\d{7}$/;
        if (!airtelRegex.test(localNumber)) {
          errors.phoneNumber =
            "Airtel Money requires a number starting with 097 or 077";
        }
      } else if (donationData.paymentMethod === "mtn_mobile_money") {
        const mtnRegex = /^(096|076)\d{7}$/;
        if (!mtnRegex.test(localNumber)) {
          errors.phoneNumber =
            "MTN Mobile Money requires a number starting with 096 or 076";
        }
      } else {
        // General Zambian mobile number validation
        const generalRegex = /^(097|077|096|076)\d{7}$/;
        if (!generalRegex.test(localNumber)) {
          errors.phoneNumber =
            "Phone number must be a valid Zambian mobile number";
        }
      }
    } else {
      // Local format validation (without +260 prefix)
      if (donationData.paymentMethod === "airtel_money") {
        const airtelRegex = /^(0?97|0?77)\d{7}$/;
        if (!airtelRegex.test(cleanPhone)) {
          errors.phoneNumber =
            "Airtel Money requires a number starting with 097 or 077";
        }
      } else if (donationData.paymentMethod === "mtn_mobile_money") {
        const mtnRegex = /^(0?96|0?76)\d{7}$/;
        if (!mtnRegex.test(cleanPhone)) {
          errors.phoneNumber =
            "MTN Mobile Money requires a number starting with 096 or 076";
        }
      } else {
        // General Zambian mobile number validation
        const generalRegex = /^(0?97|0?77|0?96|0?76)\d{7}$/;
        if (!generalRegex.test(cleanPhone)) {
          errors.phoneNumber =
            "Phone number must be a valid Zambian mobile number";
        }
      }
    }
  }

  // Validate message
  if (donationData.messageText && donationData.messageText.length > 1000) {
    errors.messageText = "Message cannot exceed 1000 characters";
  }

  // Check for harmful content in message
  if (donationData.messageText) {
    const harmfulPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(donationData.messageText)) {
        errors.messageText = "Message contains potentially harmful content";
        break;
      }
    }
  }

  // Validate campaign ID
  if (!donationData.campaignId) {
    errors.campaignId = "Campaign ID is required";
  }

  // Validate payment method
  if (!donationData.gatewayUsed) {
    errors.gatewayUsed = "Payment method is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  createDonation,
  getDonationById,
  getDonationsByCampaign,
  getUserDonations,
  validateDonationData,
};
