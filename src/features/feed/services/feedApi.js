import apiClient from "../../../services/apiClient";

export const createPost = async (postData) => {
  try {
    const formData = new FormData();

    // Add basic post data
    formData.append("type", postData.type);
    if (postData.title) formData.append("title", postData.title);
    if (postData.body) formData.append("body", postData.body);
    if (postData.campaignId) formData.append("campaignId", postData.campaignId);
    formData.append("isPinnedToCampaign", postData.isPinnedToCampaign || false);

    // Add media files
    if (postData.media && postData.media.length > 0) {
      postData.media.forEach((mediaItem) => {
        formData.append("media", mediaItem.file);
      });
    }

    const response = await apiClient.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    // Normalize error messages for better UX
    const errorResponse = error.response?.data;

    if (errorResponse?.message) {
      // Handle validation errors
      if (errorResponse.message.includes("Post type must be one of")) {
        throw new Error("Please select a valid post type");
      }
      if (errorResponse.message.includes("Campaign ID must be a valid UUID")) {
        throw new Error("Please select a valid campaign");
      }
      if (
        errorResponse.message.includes(
          "Campaign-related posts must be associated"
        )
      ) {
        throw new Error("Please select a campaign for this post type");
      }
      if (errorResponse.message.includes("Title cannot exceed")) {
        throw new Error(
          "Title is too long. Please keep it under 200 characters"
        );
      }
      if (errorResponse.message.includes("Body cannot exceed")) {
        throw new Error(
          "Content is too long. Please keep it under 5000 characters"
        );
      }

      // Return the original message if it's user-friendly
      throw new Error(errorResponse.message);
    }

    // Handle network/server errors
    if (error.code === "NETWORK_ERROR" || !error.response) {
      throw new Error(
        "Network error. Please check your connection and try again"
      );
    }

    if (error.response?.status === 500) {
      throw new Error("Server error. Please try again later");
    }

    if (error.response?.status === 401) {
      throw new Error("Please log in to create posts");
    }

    if (error.response?.status === 403) {
      throw new Error("You don't have permission to create posts");
    }

    // Default fallback
    throw new Error("Failed to create post. Please try again");
  }
};

export const getPosts = async (params = {}) => {
  try {
    const response = await apiClient.get("/posts", { params });
    // Extract data from the response structure
    return response.data?.data || response.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch posts");
  }
};

export const getPostById = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data?.data || response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Post not found");
    }
    throw new Error(error.response?.data?.message || "Failed to fetch post");
  }
};

export const getCampaignPosts = async (campaignId, params = {}) => {
  try {
    const response = await apiClient.get(`/posts/campaigns/${campaignId}`, {
      params,
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch campaign posts"
    );
  }
};

export const getOrganizerPosts = async (organizerId, params = {}) => {
  try {
    const response = await apiClient.get(`/posts/organizers/${organizerId}`, {
      params,
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch organizer posts"
    );
  }
};

export const getOrganizerCampaignPosts = async (organizerId, params = {}) => {
  try {
    const response = await apiClient.get(
      `/posts/organizers/${organizerId}/campaigns`,
      {
        params,
      }
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch organizer campaign posts"
    );
  }
};

export const toggleLikePost = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data?.data || response.data; // { liked, likesCount }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update like");
  }
};
