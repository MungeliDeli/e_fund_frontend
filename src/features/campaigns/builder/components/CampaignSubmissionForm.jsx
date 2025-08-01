import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiPlus, FiX, FiUpload } from "react-icons/fi";
import FormField from "../../../../components/FormField";
import SearchableDropdown from "../../../../components/SearchableDropdown";
import { getCategories } from "../../services/categoriesApi";
import { submitCampaignForApproval } from "../../services/campaignApi";
import { compressImage } from "../../../../utils/imageCompression";
import { validateCampaignSubmission } from "../../services/campaignValidation";
import { v4 as uuidv4 } from "uuid";

const MAX_IMAGE_SIZE_MB = 10;
const WARN_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_DIMENSION = 1024;
const MAX_CATEGORIES = 3;

function CampaignSubmissionForm({
  campaignId,
  customPageSettings,
  templateId,
  onBack,
}) {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    startDate: "",
    endDate: "",
    mainMediaId: null,
    campaignLogoMediaId: null,
  });

  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  // Image state
  const [mainImage, setMainImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [mainFile, setMainFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [warnMsg, setWarnMsg] = useState(null);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      setApiError("");
      setApiSuccess("");
      return submitCampaignForApproval(campaignId, formData);
    },
    onSuccess: (data) => {
      setApiSuccess("Campaign submitted for approval successfully!");
      setTimeout(() => {
        navigate("/campaigns/my-campaigns");
      }, 2000);
    },
    onError: (error) => {
      let msg = "An error occurred. Please try again.";
      if (error?.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          msg = "You do not have permission to perform this action.";
        } else if (status === 404) {
          msg = "The requested resource was not found.";
        } else if (status === 400 && error.response.data?.message) {
          msg = error.response.data.message;
        } else if (status >= 500) {
          msg = "A server error occurred. Please try again later.";
        }
      } else if (error?.message) {
        msg = error.message;
      }
      setApiError(msg);
    },
  });

  // Load categories when data is available
  useEffect(() => {
    if (categoriesData?.data?.categories) {
      setCategories(categoriesData.data.categories);
    } else if (Array.isArray(categoriesData?.data)) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  // Image compression handler
  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg(null);
    setWarnMsg(null);

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
      setErrorMsg(error);
      return;
    }
    if (warning) setWarnMsg(warning);

    const url = URL.createObjectURL(compressed);
    if (type === "main") {
      setMainFile(compressed);
      setMainImage(url);
    } else {
      setLogoFile(compressed);
      setLogoImage(url);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === "main") {
      setMainImage(null);
      setMainFile(null);
    } else {
      setLogoImage(null);
      setLogoFile(null);
    }
  };

  // Category handlers
  const addCategory = () => {
    if (selectedCategories.length < MAX_CATEGORIES) {
      setSelectedCategories([
        ...selectedCategories,
        { id: uuidv4(), categoryId: "" },
      ]);
    }
  };

  const removeCategory = (index) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const updateCategory = (index, categoryId) => {
    const updated = [...selectedCategories];
    updated[index].categoryId = categoryId;
    setSelectedCategories(updated);
  };

  // Form handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (submitAttempted) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validateForm = () => {
    const categoryIds = selectedCategories
      .map((cat) => cat.categoryId)
      .filter((id) => id);

    // Check for duplicate categories
    const uniqueIds = new Set(categoryIds);
    if (categoryIds.length !== uniqueIds.size) {
      return { categories: "Duplicate categories are not allowed" };
    }

    const formData = {
      title: form.title,
      description: form.description,
      goalAmount: parseFloat(form.goalAmount),
      startDate: form.startDate,
      endDate: form.endDate,
      categoryIds,
      customPageSettings,
      templateId,
    };

    try {
      validateCampaignSubmission(formData);
      return {};
    } catch (err) {
      if (err.isJoi && err.details) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          fieldErrors[d.path[0]] = d.message;
        });
        return fieldErrors;
      } else {
        return { general: "Validation failed. Please check your input." };
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setErrors({});
    setApiError("");
    setApiSuccess("");

    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const formData = {
        title: form.title,
        description: form.description,
        goalAmount: parseFloat(form.goalAmount),
        startDate: form.startDate,
        endDate: form.endDate,
        categoryIds: selectedCategories
          .map((cat) => cat.categoryId)
          .filter((id) => id),
        customPageSettings,
        templateId,
      };

      mutation.mutate(formData);
    } catch (err) {
      setErrors({ general: "Validation failed. Please check your input." });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[color:var(--color-secondary-text)] rounded-md hover:text-[color:var(--color-primary)] transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Builder</span>
        </button>
        <h2 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Submit Campaign for Approval
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Campaign Title */}
          <FormField
            label="Campaign Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            error={submitAttempted ? errors.title : undefined}
          />

          {/* Goal Amount */}
          <FormField
            label="Goal Amount ($)"
            name="goalAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.goalAmount}
            onChange={handleChange}
            required
            error={submitAttempted ? errors.goalAmount : undefined}
          />

          {/* Start Date */}
          <FormField
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
            error={submitAttempted ? errors.startDate : undefined}
          />

          {/* End Date */}
          <FormField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
            error={submitAttempted ? errors.endDate : undefined}
          />

          {/* Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <FormField
              label="Campaign Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              type="textarea"
              required
              error={submitAttempted ? errors.description : undefined}
            />
          </div>

          {/* Categories */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[color:var(--color-primary-text)]">
                  Campaign Categories
                </label>
                {selectedCategories.length < MAX_CATEGORIES && (
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-accent)] transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Category
                  </button>
                )}
              </div>

              {selectedCategories.length === 0 && (
                <p className="text-sm text-[color:var(--color-secondary-text)]">
                  Select at least one category for your campaign
                </p>
              )}

              {selectedCategories.map((category, index) => (
                <div key={category.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <SearchableDropdown
                      options={categories}
                      value={category.categoryId}
                      onChange={(categoryId) =>
                        updateCategory(index, categoryId)
                      }
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : "Search for a category..."
                      }
                      disabled={categoriesLoading}
                      error={submitAttempted && errors.categories}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {submitAttempted && errors.categories && (
                <p className="text-sm text-red-500">{errors.categories}</p>
              )}
            </div>
          </div>

          {/* Main Campaign Image */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-primary-text)]">
                Main Campaign Image
              </label>
              <div className="w-full h-32 rounded-lg overflow-hidden border border-[color:var(--color-muted)]">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt="Main campaign"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[color:var(--color-surface)] flex items-center justify-center">
                    <span className="text-[color:var(--color-secondary-text)]">
                      No image selected
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="main-image"
                onChange={(e) => handleImageChange(e, "main")}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById("main-image").click()}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-accent)] transition-colors"
                >
                  <FiUpload className="w-4 h-4" />
                  Upload Image
                </button>
                {mainImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("main")}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Logo */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-primary-text)]">
                Campaign Logo
              </label>
              <div className="w-full h-32 rounded-lg overflow-hidden border border-[color:var(--color-muted)]">
                {logoImage ? (
                  <img
                    src={logoImage}
                    alt="Campaign logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[color:var(--color-surface)] flex items-center justify-center">
                    <span className="text-[color:var(--color-secondary-text)]">
                      No logo selected
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-image"
                onChange={(e) => handleImageChange(e, "logo")}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById("logo-image").click()}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-accent)] transition-colors"
                >
                  <FiUpload className="w-4 h-4" />
                  Upload Logo
                </button>
                {logoImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("logo")}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Image UX messages */}
          {(errorMsg || warnMsg) && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              {warnMsg && (
                <div className="text-yellow-600 text-xs mb-1">{warnMsg}</div>
              )}
              {errorMsg && (
                <div className="text-red-500 text-xs mb-1">{errorMsg}</div>
              )}
              <div className="text-xs text-[color:var(--color-secondary-text)]">
                Max file size: {MAX_IMAGE_SIZE_MB}MB. Images will be
                automatically resized to {MAX_IMAGE_DIMENSION}px and compressed
                after upload.
              </div>
            </div>
          )}
        </div>

        {/* API error/success messages */}
        {(apiError || apiSuccess) && (
          <div className="mt-6">
            {apiError && (
              <div className="text-red-600 text-sm mb-2">{apiError}</div>
            )}
            {apiSuccess && (
              <div className="text-green-600 text-sm mb-2">{apiSuccess}</div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="px-6 py-2 rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)] transition-colors"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Submitting..." : "Submit for Approval"}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)] font-medium hover:bg-[color:var(--color-surface)] transition-colors"
            onClick={onBack}
            disabled={mutation.isLoading}
          >
            Back to Builder
          </button>
        </div>
      </form>
    </div>
  );
}

export default CampaignSubmissionForm;
