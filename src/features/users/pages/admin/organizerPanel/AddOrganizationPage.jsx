import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormField from "../../../../../components/FormField";
import ProfileImage from "../../../components/ProfileImage";
import CoverImage from "../../../components/CoverImage";
import { FiUpload, FiX, FiCheckCircle, FiMail } from "react-icons/fi";
import { organizationSchema } from "../../../services/userValidation";
import { compressImage } from "../../../../../utils/imageCompression";
import { useMutation } from "@tanstack/react-query";
import { createOrganizationUser } from "../../../../auth/services/authApi";
import {
  fetchPrivateOrganizationProfile,
  updateOrganizationProfile,
  updateOrganizationProfileWithImages,
  fetchOrganizerById,
} from "../../../services/usersApi";
import { useAuth } from "../../../../../contexts/AuthContext";

const MAX_IMAGE_SIZE_MB = 10;
const WARN_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_DIMENSION = 1024;

function AddOrganizationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Determine mode based on user type
  const isEditMode = user?.userType === "organizationUser";
  const organizerId = id; // For admin editing specific organizer

  // Form state
  const [form, setForm] = useState({
    organizationName: "",
    organizationShortName: "",
    organizationType: "",
    officialEmail: "",
    officialWebsiteUrl: "",
    address: "",
    missionDescription: "",
    establishmentDate: "",
    campusAffiliationScope: "",
    primaryContactPersonName: "",
    primaryContactPersonEmail: "",
    primaryContactPersonPhone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  // Image state
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [remProfile, setRemProfile] = useState(false);
  const [remCover, setRemCover] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [warnMsg, setWarnMsg] = useState(null);
  const profileInputRef = useRef();
  const coverInputRef = useRef();
  const [apiError, setApiError] = useState("");
  const [apiErrorDetails, setApiErrorDetails] = useState(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [apiSuccess, setApiSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          setLoading(true);
          let data;

          if (user?.userType === "organizationUser") {
            // Organizer editing their own profile
            data = await fetchPrivateOrganizationProfile();
            console.log(data);
          } else if (organizerId) {
            // Admin editing specific organizer
            data = await fetchOrganizerById(organizerId);
          }

          // Data is directly in data.data, not nested under profile
          if (data?.data) {
            setForm({
              organizationName: data.data.organizationName || "",
              organizationShortName: data.data.organizationShortName || "",
              organizationType: data.data.organizationType || "",
              officialEmail: data.data.officialEmail || data.data.email || "",
              officialWebsiteUrl: data.data.officialWebsiteUrl || "",
              address: data.data.address || "",
              missionDescription: data.data.missionDescription || "",
              establishmentDate: data.data.establishmentDate
                ? new Date(data.data.establishmentDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              campusAffiliationScope: data.data.campusAffiliationScope || "",
              primaryContactPersonName:
                data.data.primaryContactPersonName || "",
              primaryContactPersonEmail:
                data.data.primaryContactPersonEmail || "",
              primaryContactPersonPhone:
                data.data.primaryContactPersonPhone || "",
            });
          }
        } catch (error) {
          setApiError("Failed to fetch organization data");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isEditMode, user?.userType, organizerId]);

  // React Query mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      setApiError("");
      setApiErrorDetails(null);
      setApiSuccess("");

      if (isEditMode) {
        // Check if we have images to upload
        const hasImages = profileFile || coverFile;
        if (hasImages) {
          // Use the new endpoint that handles both profile data and images
          return updateOrganizationProfileWithImages(formData);
        } else {
          // Use the regular endpoint for profile data only
          return updateOrganizationProfile(formData);
        }
      } else {
        return createOrganizationUser(formData);
      }
    },
    onSuccess: (data) => {
      if (isEditMode) {
        setApiSuccess("Organization details updated successfully!");
        // Redirect based on user type
        setTimeout(() => {
          if (user?.userType === "organizationUser") {
            navigate("/organizer/settings");
          } else {
            navigate("/admin/organizers");
          }
        }, 2000);
      } else {
        setShowSuccessModal(true);
        setForm({
          organizationName: "",
          organizationShortName: "",
          organizationType: "",
          officialEmail: "",
          officialWebsiteUrl: "",
          address: "",
          missionDescription: "",
          establishmentDate: "",
          campusAffiliationScope: "",
          primaryContactPersonName: "",
          primaryContactPersonEmail: "",
          primaryContactPersonPhone: "",
        });
        setProfileImage(null);
        setCoverImage(null);
        setProfileFile(null);
        setCoverFile(null);
        setRemProfile(false);
        setRemCover(false);
        setSubmitAttempted(false);
      }
    },
    onError: (error) => {
      let msg = "An error occurred. Please try again.";
      let details = null;
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
        details = error.response.data;
      } else if (error?.message) {
        msg = error.message;
        details = error;
      }
      setApiError(msg);
      setApiErrorDetails(details);
    },
  });

  // Image compression (dummy, real compression can be added)
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
    if (type === "profile") {
      setProfileFile(compressed);
      setProfileImage(url);
      setRemProfile(false);
    } else {
      setCoverFile(compressed);
      setCoverImage(url);
      setRemCover(false);
    }
  };
  const handleRemoveImage = (type) => {
    if (type === "profile") {
      setProfileImage(null);
      setProfileFile(null);
      setRemProfile(true);
    } else {
      setCoverImage(null);
      setCoverFile(null);
      setRemCover(true);
    }
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate establishment date to prevent future dates
    if (name === "establishmentDate" && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today

      if (selectedDate > today) {
        setErrors({
          ...errors,
          establishmentDate: "Establishment date cannot be in the future",
        });
        return;
      }
    }

    setForm({ ...form, [name]: value });
    if (submitAttempted) setErrors({ ...errors, [name]: undefined });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setErrors({});
    setApiError("");
    setApiSuccess("");
    try {
      await organizationSchema.validateAsync(form, { abortEarly: false });

      if (isEditMode) {
        // Check if we have images to upload
        const hasImages = profileFile || coverFile;
        if (hasImages) {
          // Create FormData for profile data and images
          const formData = new FormData();
          // Add profile data
          Object.keys(form).forEach((key) => {
            if (
              form[key] !== undefined &&
              form[key] !== null &&
              form[key] !== ""
            ) {
              formData.append(key, form[key]);
            }
          });
          // Add image files
          if (profileFile) formData.append("profilePicture", profileFile);
          if (coverFile) formData.append("coverPicture", coverFile);
          mutation.mutate(formData);
        } else {
          // For edit mode without images, send JSON data
          mutation.mutate(form);
        }
      } else {
        // For create mode, send FormData
        const formData = new FormData();
        // Backend expects camelCase keys (see backend code)
        formData.append("organizationName", form.organizationName);
        formData.append("organizationShortName", form.organizationShortName);
        formData.append("organizationType", form.organizationType);
        formData.append("officialEmail", form.officialEmail);
        formData.append("officialWebsiteUrl", form.officialWebsiteUrl);
        formData.append("address", form.address);
        formData.append("missionDescription", form.missionDescription);
        formData.append("establishmentDate", form.establishmentDate);
        formData.append("campusAffiliationScope", form.campusAffiliationScope);
        formData.append(
          "primaryContactPersonName",
          form.primaryContactPersonName
        );
        formData.append(
          "primaryContactPersonEmail",
          form.primaryContactPersonEmail
        );
        formData.append(
          "primaryContactPersonPhone",
          form.primaryContactPersonPhone
        );
        if (profileFile) formData.append("profilePicture", profileFile);
        if (coverFile) formData.append("coverPicture", coverFile);
        // Email is required for user creation (see backend)
        formData.append("email", form.officialEmail);
        mutation.mutate(formData);
      }
    } catch (err) {
      if (err.isJoi && err.details) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          fieldErrors[d.path[0]] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: "Validation failed. Please check your input." });
      }
    }
  };
  const handleCancel = () => {
    if (isEditMode) {
      if (user?.userType === "organizationUser") {
        navigate("/organizer/settings");
      } else {
        navigate("/admin/organizers");
      }
    } else {
      navigate("/admin/organizers");
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/admin/organizers");
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-[color:var(--color-background)] min-h-screen transition-colors">
        <div className="text-center text-[color:var(--color-secondary-text)] py-8">
          Loading organization details...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-[color:var(--color-primary-text)]">
        {isEditMode ? "Edit Organization Details" : "Add New Organization"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Organization Name */}
          <FormField
            label="Organization Name"
            name="organizationName"
            value={form.organizationName}
            onChange={handleChange}
            required
            error={submitAttempted ? errors.organizationName : undefined}
          />
          {/* Short Name */}
          <FormField
            label="Short Name"
            name="organizationShortName"
            value={form.organizationShortName}
            onChange={handleChange}
            error={submitAttempted ? errors.organizationShortName : undefined}
          />
          {/* Organization Type */}
          <FormField
            label="Organization Type"
            name="organizationType"
            value={form.organizationType}
            onChange={handleChange}
            required
            error={submitAttempted ? errors.organizationType : undefined}
          />
          {/* Official Email */}
          <FormField
            label="Official Email"
            name="officialEmail"
            type="email"
            value={form.officialEmail}
            onChange={handleChange}
            required
            error={submitAttempted ? errors.officialEmail : undefined}
          />
          {/* Official Website */}
          <FormField
            label="Official Website URL"
            name="officialWebsiteUrl"
            type="url"
            value={form.officialWebsiteUrl}
            onChange={handleChange}
            error={submitAttempted ? errors.officialWebsiteUrl : undefined}
          />
          {/* Address */}
          <FormField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={submitAttempted ? errors.address : undefined}
          />
          {/* Mission Description */}
          <FormField
            label="Mission Description"
            name="missionDescription"
            value={form.missionDescription}
            onChange={handleChange}
            type="textarea"
            error={submitAttempted ? errors.missionDescription : undefined}
          />
          {/* Establishment Date */}
          <FormField
            label="Establishment Date"
            name="establishmentDate"
            type="date"
            value={form.establishmentDate}
            onChange={handleChange}
            error={submitAttempted ? errors.establishmentDate : undefined}
          />
          {/* Campus Affiliation Scope */}
          <FormField
            label="Campus Affiliation Scope"
            name="campusAffiliationScope"
            value={form.campusAffiliationScope}
            onChange={handleChange}
            placeholder="e.g. Main, East, West"
            error={submitAttempted ? errors.campusAffiliationScope : undefined}
          />
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-xs text-[color:var(--color-secondary-text)] mt-4">
            Comma-separated for multiple values: Campus Affiliation Scope.
          </div>
          {/* Primary Contact Name */}
          <FormField
            label="Primary Contact Name"
            name="primaryContactPersonName"
            value={form.primaryContactPersonName}
            onChange={handleChange}
            required
            error={
              submitAttempted ? errors.primaryContactPersonName : undefined
            }
          />
          {/* Primary Contact Email */}
          <FormField
            label="Primary Contact Email"
            name="primaryContactPersonEmail"
            type="email"
            value={form.primaryContactPersonEmail}
            onChange={handleChange}
            required
            error={
              submitAttempted ? errors.primaryContactPersonEmail : undefined
            }
          />
          {/* Primary Contact Phone */}
          <FormField
            label="Primary Contact Phone"
            name="primaryContactPersonPhone"
            value={form.primaryContactPersonPhone}
            onChange={handleChange}
            required
            error={
              submitAttempted ? errors.primaryContactPersonPhone : undefined
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Image Upload */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col gap-2">
            <span className="text-sm text-[color:var(--color-secondary-text)]">
              Profile Picture
            </span>
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProfileImage
                  mediaId={null}
                  size="xl"
                  alt="Profile"
                  className="w-full h-full"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={profileInputRef}
              onChange={(e) => handleImageChange(e, "profile")}
            />
            <div className="flex gap-2">
              <button
                className="px-2 py-1 text-xs rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)]"
                type="button"
                onClick={() => profileInputRef.current?.click()}
              >
                <FiUpload className="inline mr-1" /> Change picture
              </button>
              {profileImage && (
                <button
                  className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 font-medium hover:bg-red-200"
                  type="button"
                  onClick={() => handleRemoveImage("profile")}
                >
                  <FiX className="inline mr-1" /> Remove
                </button>
              )}
            </div>
          </div>
          {/* Cover Image Upload */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col gap-2">
            <span className="text-sm text-[color:var(--color-secondary-text)]">
              Cover Picture
            </span>
            <div className="w-full max-w-lg h-24 rounded overflow-hidden mb-2">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <CoverImage
                  mediaId={null}
                  alt="Cover"
                  className="w-full h-full"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={coverInputRef}
              onChange={(e) => handleImageChange(e, "cover")}
            />
            <div className="flex gap-2">
              <button
                className="px-2 py-1 text-xs rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)]"
                type="button"
                onClick={() => coverInputRef.current?.click()}
              >
                <FiUpload className="inline mr-1" /> Change picture
              </button>
              {coverImage && (
                <button
                  className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 font-medium hover:bg-red-200"
                  type="button"
                  onClick={() => handleRemoveImage("cover")}
                >
                  <FiX className="inline mr-1" /> Remove
                </button>
              )}
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
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2">
            {apiError && (
              <div className="text-red-600 text-sm mb-2">{apiError}</div>
            )}
            {apiSuccess && (
              <div className="text-green-600 text-sm mb-2">{apiSuccess}</div>
            )}
          </div>
        )}
        {/* Form Actions */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex gap-4 mt-4">
          <button
            type="submit"
            className="px-6 py-2 rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode
                  ? "Updating Organization..."
                  : "Creating Organization..."}
              </>
            ) : isEditMode ? (
              "Update Organization"
            ) : (
              "Create Organization"
            )}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)] font-medium hover:bg-[color:var(--color-surface)] transition-colors"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-background)] border border-[color:var(--color-muted)] rounded-lg p-8 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[color:var(--color-primary)] mb-4">
                <FiCheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-2">
                Organization Created Successfully!
              </h3>
              <p className="text-sm text-[color:var(--color-secondary-text)] mb-6">
                The organization has been created and an invitation has been
                sent to the primary contact email. They can check their email to
                set up their password and access their account.
              </p>
              <div className="flex items-center justify-center text-sm text-[color:var(--color-primary)] mb-6">
                <FiMail className="mr-2" />
                Invitation sent to: {form.primaryContactPersonEmail}
              </div>
              <button
                onClick={handleCloseSuccessModal}
                className="w-full px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-accent)] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddOrganizationPage;
