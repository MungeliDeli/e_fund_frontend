import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../../../../components/FormField";
import SearchableDropdown from "../../../../components/SearchableDropdown";
import { PrimaryButton, SecondaryButton } from "../../../../components/Buttons";
import Notification from "../../../../components/Notification";
import { FiUpload, FiX, FiPlus, FiEye } from "react-icons/fi";
import { compressImage } from "../../../../utils/imageCompression";
import { getCategories } from "../../services/categoryApi";
import { createCampaign } from "../../services/campaignApi";

const MAX_IMAGE_SIZE_MB = 10;
const WARN_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_DIMENSION = 1024;
const MAX_SECONDARY_IMAGES = 2;

// Predefined theme colors
const THEME_COLORS = [
  { name: "Green", value: "#10B981", rgb: "16, 185, 129" },
  { name: "Blue", value: "#3B82F6", rgb: "59, 130, 246" },
  { name: "Orange", value: "#F97316", rgb: "249, 115, 22" },
  { name: "Purple", value: "#8B5CF6", rgb: "139, 92, 246" },
  { name: "Red", value: "#EF4444", rgb: "239, 68, 68" },
  { name: "Pink", value: "#EC4899", rgb: "236, 72, 153" },
  { name: "Indigo", value: "#6366F1", rgb: "99, 102, 241" },
  { name: "Teal", value: "#14B8A6", rgb: "20, 184, 166" },
];

function CreateCampaignPage() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    // Campaign Page Content
    title: "",
    message: "",
    themeColor: THEME_COLORS[0].value, // Default to green

    // Campaign Metadata
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    goalAmount: "",
    categoryIds: [], // Changed from categoryId to categoryIds array
    predefinedAmounts: ["25", "50", "100", "200"],
  });

  // Image state
  const [mainMedia, setMainMedia] = useState(null);
  const [mainMediaFile, setMainMediaFile] = useState(null);
  const [mainMediaType, setMainMediaType] = useState("image"); // "image" or "video"
  const [secondaryImages, setSecondaryImages] = useState([]);
  const [secondaryImageFiles, setSecondaryImageFiles] = useState([]);

  // UI state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageWarning, setImageWarning] = useState("");

  // Refs
  const mainMediaRef = useRef();
  const secondaryImageRefs = useRef([]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      const categoriesData = response.data.data.categories || [];

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]); // Ensure categories is always an array
      setNotification({
        isVisible: true,
        type: "error",
        message: "Failed to load categories",
      });
    }
  };

  // Category options for SearchableDropdown - ensure categories is always an array
  const categoryOptions = Array.isArray(categories)
    ? categories.map((cat) => ({
        categoryId: cat.categoryId,
        name: cat.name,
      }))
    : [];

  // Helper function to get category names for display
  const getCategoryNames = (categoryIds) => {
    return categoryIds
      .filter((id) => id && id.trim() !== "")
      .map((id) => {
        const category = categories.find((cat) => cat.categoryId === id);
        return category ? category.name : "Unknown Category";
      });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (submitAttempted) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle predefined amounts (fixed to 4 amounts)
  const handlePredefinedAmountChange = (index, value) => {
    const newAmounts = [...form.predefinedAmounts];
    newAmounts[index] = value;
    setForm((prev) => ({ ...prev, predefinedAmounts: newAmounts }));
  };

  // Handle main media upload
  const handleMainMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError("");
    setImageWarning("");

    const isVideo = file.type.startsWith("video/");

    if (isVideo) {
      // Handle video upload (no compression needed)
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setImageError(
          `Video file too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB`
        );
        return;
      }
      setMainMediaType("video");
      setMainMediaFile(file);
      setMainMedia(URL.createObjectURL(file));
    } else {
      // Handle image upload with compression
      const {
        file: compressed,
        warning,
        error,
      } = await compressImage(file, {
        maxSizeMB: MAX_IMAGE_SIZE_MB,
        warnSizeMB: WARN_IMAGE_SIZE_MB,
        maxDimension: MAX_IMAGE_DIMENSION,
      });

      if (error) {
        setImageError(error);
        return;
      }
      if (warning) setImageWarning(warning);

      setMainMediaType("image");
      setMainMediaFile(compressed);
      setMainMedia(URL.createObjectURL(compressed));
    }
  };

  // Handle secondary image upload
  const handleSecondaryImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError("");
    setImageWarning("");

    const {
      file: compressed,
      warning,
      error,
    } = await compressImage(file, {
      maxSizeMB: MAX_IMAGE_SIZE_MB,
      warnSizeMB: WARN_IMAGE_SIZE_MB,
      maxDimension: MAX_IMAGE_DIMENSION,
    });

    if (error) {
      setImageError(error);
      return;
    }
    if (warning) setImageWarning(warning);

    const newImages = [...secondaryImages];
    const newFiles = [...secondaryImageFiles];

    newImages[index] = URL.createObjectURL(compressed);
    newFiles[index] = compressed;

    setSecondaryImages(newImages);
    setSecondaryImageFiles(newFiles);
  };

  // Add secondary image slot
  const addSecondaryImageSlot = () => {
    if (secondaryImages.length < MAX_SECONDARY_IMAGES) {
      setSecondaryImages((prev) => [...prev, null]);
      setSecondaryImageFiles((prev) => [...prev, null]);
    }
  };

  // Remove secondary image
  const removeSecondaryImage = (index) => {
    const newImages = secondaryImages.filter((_, i) => i !== index);
    const newFiles = secondaryImageFiles.filter((_, i) => i !== index);
    setSecondaryImages(newImages);
    setSecondaryImageFiles(newFiles);
  };

  // Remove main media
  const removeMainMedia = () => {
    setMainMedia(null);
    setMainMediaFile(null);
    setMainMediaType("image");
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Campaign title is required";
    if (!form.message.trim())
      newErrors.message = "Campaign message is required";
    if (!form.name.trim()) newErrors.name = "Campaign name is required";
    if (!form.description.trim())
      newErrors.description = "Campaign description is required";
    if (!form.goalAmount || parseFloat(form.goalAmount) <= 0) {
      newErrors.goalAmount = "Goal amount must be greater than 0";
    }
    // Validate dates if provided
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (start >= end) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    // Validate categories (at least one, max 3)
    if (form.categoryIds.length === 0) {
      newErrors.categoryIds = "Please select at least one category";
    } else {
      // Check if any category is empty or invalid
      const validCategoryIds = form.categoryIds.filter(
        (id) => id && id.trim() !== ""
      );
      if (validCategoryIds.length === 0) {
        newErrors.categoryIds = "Please select at least one valid category";
      }
      if (validCategoryIds.length !== form.categoryIds.length) {
        newErrors.categoryIds = "Please fill in all selected category slots";
      }

      // Check for duplicate categories
      const uniqueCategoryIds = [...new Set(validCategoryIds)];
      if (uniqueCategoryIds.length !== validCategoryIds.length) {
        newErrors.categoryIds = "Duplicate categories are not allowed";
      }
    }

    // Validate predefined amounts (all 4 must be valid)
    const validAmounts = form.predefinedAmounts.filter(
      (amount) => amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0
    );
    if (validAmounts.length < 4) {
      newErrors.predefinedAmounts = "All 4 predefined amounts are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) {
      setNotification({
        isVisible: true,
        type: "error",
        message: "Please fix the errors below",
      });
      return;
    }

    try {
      setLoading(true);

      // Build FormData for submission
      const formData = new FormData();

      // Campaign metadata (goes to campaigns table)
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("goalAmount", form.goalAmount);
      formData.append(
        "categoryIds",
        JSON.stringify(form.categoryIds.filter((id) => id && id.trim() !== ""))
      );
      formData.append("status", "pendingApproval");

      // Optional dates
      if (form.startDate) formData.append("startDate", form.startDate);
      if (form.endDate) formData.append("endDate", form.endDate);

      // Create campaignSettings JSON in frontend
      const campaignSettings = {
        title: form.title,
        message: form.message,
        themeColor: form.themeColor,
        predefinedAmounts: form.predefinedAmounts.filter(
          (amount) =>
            amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0
        ),
      };

      // Append campaignSettings as JSON string
      formData.append("campaignSettings", JSON.stringify(campaignSettings));

      // Main media
      if (mainMediaFile) {
        formData.append("mainMedia", mainMediaFile);
        formData.append("mainMediaType", mainMediaType);
      }

      // Secondary images
      secondaryImageFiles.forEach((file, index) => {
        if (file) {
          formData.append(`secondaryImage${index}`, file);
        }
      });

      await createCampaign(formData);

      setNotification({
        isVisible: true,
        type: "success",
        message: "Campaign created successfully!",
      });

      // Navigate back after success
      setTimeout(() => {
        navigate("/organizer/campaigns");
      }, 2000);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setNotification({
        isVisible: true,
        type: "error",
        message: error?.response?.data?.message || "Failed to create campaign",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() =>
          setNotification((prev) => ({ ...prev, isVisible: false }))
        }
        duration={4000}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
            Create New Campaign
          </h1>
          <p className="text-[color:var(--color-secondary-text)] mt-1">
            Create a compelling campaign to reach your fundraising goals
          </p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton
            icon={FiEye}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Preview"}
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate(-1)}>Cancel</SecondaryButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Campaign Page Content Section */}
        <div className="bg-[color:var(--color-background)] p-6 rounded-lg border border-[color:var(--color-muted)] shadow-md">
          <h2 className="text-xl font-semibold text-[color:var(--color-primary-text)] mb-4 border-b border-[color:var(--color-muted)] pb-2">
            Campaign Page Content
          </h2>

          <div className="space-y-4">
            {/* Campaign Title */}
            <FormField
              label="Campaign Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              error={submitAttempted ? errors.title : undefined}
              placeholder="Enter the title that will be displayed on your campaign page"
            />

            {/* Campaign Message */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Campaign Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)]"
                placeholder="Write a compelling message that will inspire people to donate to your campaign"
              />
              {submitAttempted && errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>

            {/* Theme Color Selection */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Theme Color
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, themeColor: color.value }))
                    }
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      form.themeColor === color.value
                        ? "border-gray-800 scale-110 shadow-lg"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {form.themeColor === color.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[color:var(--color-secondary-text)] text-sm mt-2">
                Selected:{" "}
                {THEME_COLORS.find((c) => c.value === form.themeColor)?.name ||
                  "Custom"}
              </p>
            </div>

            {/* Main Media Upload */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Main Media (Image or Video)
              </label>

              {mainMedia ? (
                <div className="relative">
                  {mainMediaType === "video" ? (
                    <video
                      src={mainMedia}
                      controls
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={mainMedia}
                      alt="Main campaign media"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeMainMedia}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => mainMediaRef.current?.click()}
                  className="w-full max-w-md h-48 border-2 border-dashed border-[color:var(--color-muted)] rounded-lg flex items-center justify-center cursor-pointer hover:border-[color:var(--color-primary)] transition-colors"
                >
                  <div className="text-center">
                    <FiUpload className="w-8 h-8 text-[color:var(--color-secondary-text)] mx-auto mb-2" />
                    <p className="text-[color:var(--color-secondary-text)]">
                      Click to upload image or video
                    </p>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={mainMediaRef}
                onChange={handleMainMediaChange}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>

            {/* Secondary Images */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Additional Images (Optional)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secondaryImages.map((image, index) => (
                  <div key={index} className="relative">
                    {image ? (
                      <>
                        <img
                          src={image}
                          alt={`Secondary image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeSecondaryImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div
                        onClick={() =>
                          secondaryImageRefs.current[index]?.click()
                        }
                        className="w-full h-32 border-2 border-dashed border-[color:var(--color-muted)] rounded-lg flex items-center justify-center cursor-pointer hover:border-[color:var(--color-primary)] transition-colors"
                      >
                        <FiUpload className="w-6 h-6 text-[color:var(--color-secondary-text)]" />
                      </div>
                    )}

                    <input
                      type="file"
                      ref={(el) => (secondaryImageRefs.current[index] = el)}
                      onChange={(e) => handleSecondaryImageChange(e, index)}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ))}
              </div>

              {secondaryImages.length < MAX_SECONDARY_IMAGES && (
                <SecondaryButton
                  type="button"
                  icon={FiPlus}
                  onClick={addSecondaryImageSlot}
                  className="mt-4"
                >
                  Add Image ({secondaryImages.length + 1}/{MAX_SECONDARY_IMAGES}
                  )
                </SecondaryButton>
              )}

              {(imageError || imageWarning) && (
                <div className="mt-2">
                  {imageWarning && (
                    <p className="text-yellow-600 text-sm">{imageWarning}</p>
                  )}
                  {imageError && (
                    <p className="text-red-500 text-sm">{imageError}</p>
                  )}
                  <p className="text-[color:var(--color-secondary-text)] text-xs mt-1">
                    Max file size: {MAX_IMAGE_SIZE_MB}MB. Images will be
                    automatically resized and compressed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Metadata Section */}
        <div className="bg-[color:var(--color-background)] p-6 rounded-lg border border-[color:var(--color-muted)] shadow-md">
          <h2 className="text-xl font-semibold text-[color:var(--color-primary-text)] mb-4 border-b border-[color:var(--color-muted)] pb-2">
            Campaign Metadata
          </h2>

          <div className="space-y-6">
            {/* Campaign Name */}
            <FormField
              label="Campaign Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              error={submitAttempted ? errors.name : undefined}
              placeholder="Internal name for your campaign"
            />

            {/* Campaign Description */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Campaign Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)]"
                placeholder="Detailed description of your campaign for internal use"
              />
              {submitAttempted && errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Dates and Goal Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Start Date (Optional)"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                error={submitAttempted ? errors.startDate : undefined}
              />

              <FormField
                label="End Date (Optional)"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                error={submitAttempted ? errors.endDate : undefined}
              />

              <FormField
                label="Goal Amount"
                name="goalAmount"
                type="number"
                value={form.goalAmount}
                onChange={handleChange}
                required
                error={submitAttempted ? errors.goalAmount : undefined}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Categories <span className="text-red-500">*</span>
                <span className="text-sm text-[color:var(--color-secondary-text)] ml-2">
                  (
                  {
                    form.categoryIds.filter((id) => id && id.trim() !== "")
                      .length
                  }
                  /3)
                </span>
              </label>
              <div className="space-y-2">
                {form.categoryIds.map((categoryId, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <SearchableDropdown
                      options={categoryOptions.filter(
                        (option) =>
                          // Filter out already selected categories (except the current one)
                          !form.categoryIds.some(
                            (id, idx) =>
                              idx !== index && id === option.categoryId
                          )
                      )}
                      value={categoryId}
                      onChange={(value) => {
                        const newCategoryIds = [...form.categoryIds];
                        newCategoryIds[index] = value;
                        setForm((prev) => ({
                          ...prev,
                          categoryIds: newCategoryIds,
                        }));
                      }}
                      placeholder="Search and select a category"
                      error={submitAttempted ? errors.categoryIds : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newCategoryIds = form.categoryIds.filter(
                          (_, i) => i !== index
                        );
                        setForm((prev) => ({
                          ...prev,
                          categoryIds: newCategoryIds,
                        }));
                      }}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="Remove category"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {form.categoryIds.length < 3 && (
                  <SecondaryButton
                    type="button"
                    icon={FiPlus}
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        categoryIds: [...prev.categoryIds, ""],
                      }));
                    }}
                    className="w-full"
                  >
                    Add Category
                  </SecondaryButton>
                )}
              </div>
              {submitAttempted && errors.categoryIds && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryIds}
                </p>
              )}
            </div>

            {/* Predefined Donation Amounts */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-primary-text)] mb-2">
                Predefined Donation Amounts{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {form.predefinedAmounts.map((amount, index) => (
                  <div key={index}>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) =>
                        handlePredefinedAmountChange(index, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-[color:var(--color-muted)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)]"
                      placeholder={`Amount ${index + 1}`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>

              {submitAttempted && errors.predefinedAmounts && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.predefinedAmounts}
                </p>
              )}

              <p className="text-[color:var(--color-secondary-text)] text-sm mt-2">
                Enter exactly 4 donation amounts that donors can quickly select
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Preview Section */}
        {showPreview && (
          <div className="bg-[color:var(--color-background)] p-6 rounded-lg border border-[color:var(--color-muted)] shadow-md">
            <h2 className="text-xl font-semibold text-[color:var(--color-primary-text)] mb-4 border-b border-[color:var(--color-muted)] pb-2">
              Campaign Preview
            </h2>

            <div className="bg-[color:var(--color-surface)] p-4 rounded-lg">
              <h3 className="text-lg font-bold text-[color:var(--color-primary-text)] mb-2">
                {form.title || "Campaign Title"}
              </h3>

              <p className="text-[color:var(--color-secondary-text)] mb-4">
                {form.message || "Your campaign message will appear here..."}
              </p>

              {/* Categories */}
              {form.categoryIds.filter((id) => id && id.trim() !== "").length >
                0 && (
                <div className="mb-4">
                  <p className="text-sm text-[color:var(--color-secondary-text)] mb-2">
                    Categories:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getCategoryNames(form.categoryIds).map(
                      (categoryName, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                        >
                          {categoryName}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {mainMedia && (
                <div className="mb-4">
                  {mainMediaType === "video" ? (
                    <video
                      src={mainMedia}
                      controls
                      className="w-full max-w-lg h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={mainMedia}
                      alt="Campaign preview"
                      className="w-full max-w-lg h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              {secondaryImages.filter((img) => img).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {secondaryImages
                    .filter((img) => img)
                    .map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {form.predefinedAmounts
                  .filter((amount) => amount && parseFloat(amount) > 0)
                  .map((amount, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-white rounded-full text-sm"
                      style={{ backgroundColor: form.themeColor }}
                    >
                      ${amount}
                    </span>
                  ))}
              </div>

              <div className="text-sm text-[color:var(--color-secondary-text)]">
                Goal: ${form.goalAmount || "0.00"}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <SecondaryButton
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </SecondaryButton>

          <PrimaryButton type="submit" loading={loading} disabled={loading}>
            Submit
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

export default CreateCampaignPage;
