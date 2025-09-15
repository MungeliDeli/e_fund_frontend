import React, { useState, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useCampaigns } from "../../campaigns/hooks/useCampaigns";
import MediaUpload from "./MediaUpload";
import CampaignSelector from "./CampaignSelector";

const PostForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const { user } = useAuth();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const [formData, setFormData] = useState({
    type: "standalone",
    title: "",
    body: "",
    campaignId: "",
    isPinnedToCampaign: false,
    media: [],
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const postTypes = [
    {
      value: "standalone",
      label: "General Post",
      description: "Share general updates, thoughts, or announcements",
    },
    {
      value: "update",
      label: "Campaign Update",
      description: "Share campaign progress or specific updates",
    },
    {
      value: "success_story",
      label: "Success Story",
      description: "Highlight achievements and impact",
    },
    {
      value: "thank_you",
      label: "Thank You",
      description: "Express gratitude to supporters",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Clear campaignId when switching to standalone posts
      if (field === "type" && value === "standalone") {
        newData.campaignId = "";
        newData.isPinnedToCampaign = false;
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleMediaChange = (mediaFiles) => {
    setFormData((prev) => ({
      ...prev,
      media: mediaFiles,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = "Please select a post type";
    }

    // Title is always required
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Please provide a title";
    }

    // Campaign-related posts require a campaign selection
    if (formData.type !== "standalone" && !formData.campaignId) {
      newErrors.campaignId = "Please select a campaign for this post type";
    }

    // Additional validation for better UX
    if (formData.title && formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (formData.body && formData.body.length > 5000) {
      newErrors.body = "Content cannot exceed 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      campaignId:
        formData.type === "standalone" ? null : formData.campaignId || null,
      body: formData.body.trim(),
    };

    onSubmit(submitData);
  };

  const selectedPostType = postTypes.find(
    (type) => type.value === formData.type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Post Type Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Post Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {postTypes.map((type) => (
            <div
              key={type.value}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.type === type.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-muted)] hover:border-[var(--color-primary)]/50"
              }`}
              onClick={() => handleInputChange("type", type.value)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={() => handleInputChange("type", type.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--color-text)]">
                    {type.label}
                  </h3>
                  <p className="text-sm text-[var(--color-secondary-text)] mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.type && (
          <p className="mt-2 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      {/* Campaign Selection - Only show for campaign-related posts */}
      {formData.type !== "standalone" && (
        <CampaignSelector
          campaigns={campaigns}
          loading={campaignsLoading}
          selectedCampaignId={formData.campaignId}
          onCampaignChange={(campaignId) =>
            handleInputChange("campaignId", campaignId)
          }
          error={errors.campaignId}
        />
      )}

      {/* Pin to Campaign Option */}
      {formData.campaignId && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPinnedToCampaign"
            checked={formData.isPinnedToCampaign}
            onChange={(e) =>
              handleInputChange("isPinnedToCampaign", e.target.checked)
            }
            className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-muted)] rounded"
          />
          <label
            htmlFor="isPinnedToCampaign"
            className="ml-2 text-sm text-[var(--color-text)]"
          >
            Pin this post to the campaign page
          </label>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[var(--color-text)] mb-2"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Enter a catchy title for your post..."
          className="w-full px-3 py-2 border border-[var(--color-muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background)] text-[var(--color-text)]"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
          <p
            className={`text-xs ml-auto ${
              formData.title.length > 200
                ? "text-red-600"
                : formData.title.length > 180
                ? "text-yellow-600"
                : "text-[var(--color-secondary-text)]"
            }`}
          >
            {formData.title.length}/200
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-[var(--color-text)] mb-2"
        >
          Content (Optional)
        </label>
        <textarea
          id="body"
          value={formData.body}
          onChange={(e) => handleInputChange("body", e.target.value)}
          placeholder={`Share your ${selectedPostType?.label.toLowerCase()}...`}
          rows={6}
          className="w-full px-3 py-2 border border-[var(--color-muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background)] text-[var(--color-text)] resize-vertical"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.body && <p className="text-sm text-red-600">{errors.body}</p>}
          <p
            className={`text-xs ml-auto ${
              formData.body.length > 5000
                ? "text-red-600"
                : formData.body.length > 4500
                ? "text-yellow-600"
                : "text-[var(--color-secondary-text)]"
            }`}
          >
            {formData.body.length}/5000
          </p>
        </div>
      </div>

      {/* Media Upload */}
      <MediaUpload
        onMediaChange={handleMediaChange}
        currentMedia={formData.media}
        error={errors.media}
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-[var(--color-muted)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[var(--color-secondary-text)] bg-[var(--color-surface)] border border-[var(--color-muted)] rounded-md hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-medium text-white bg-[var(--color-primary)] border border-transparent rounded-md hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Post"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
