import React, { useState, useRef } from 'react';
import FormField from '../../../../../components/FormField';
import ProfileImage from '../../../components/ProfileImage';
import CoverImage from '../../../components/CoverImage';
import { FiUpload, FiX } from 'react-icons/fi';
import { organizationSchema } from '../../../services/userValidation';
import { compressImage } from '../../../../../utils/imageCompression';
import { useMutation } from '@tanstack/react-query';
import { createOrganizationUser } from '../../../../auth/services/authApi';

const MAX_IMAGE_SIZE_MB = 10;
const WARN_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_DIMENSION = 1024;

function AddOrganizationPage() {
  // Form state
  const [form, setForm] = useState({
    organization_name: '',
    organization_short_name: '',
    organization_type: '',
    official_email: '',
    official_website_url: '',
    address: '',
    mission_description: '',
    establishment_date: '',
    campus_affiliation_scope: '',
    affiliated_schools_names: '',
    affiliated_department_names: '',
    primary_contact_person_name: '',
    primary_contact_person_email: '',
    primary_contact_person_phone: '',
  });
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
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
  const [apiError, setApiError] = useState('');
  const [apiErrorDetails, setApiErrorDetails] = useState(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [apiSuccess, setApiSuccess] = useState('');

  // React Query mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      setApiError('');
      setApiErrorDetails(null);
      setApiSuccess('');
      return createOrganizationUser(formData);
    },
    onSuccess: (data) => {
      setApiSuccess('Organization created and invitation sent!');
      setForm({
        organization_name: '',
        organization_short_name: '',
        organization_type: '',
        official_email: '',
        official_website_url: '',
        address: '',
        mission_description: '',
        establishment_date: '',
        campus_affiliation_scope: '',
        affiliated_schools_names: '',
        affiliated_department_names: '',
        primary_contact_person_name: '',
        primary_contact_person_email: '',
        primary_contact_person_phone: '',
      });
      setProfileImage(null);
      setCoverImage(null);
      setProfileFile(null);
      setCoverFile(null);
      setRemProfile(false);
      setRemCover(false);
      setSubmitAttempted(false);
    },
    onError: (error) => {
      let msg = 'An error occurred. Please try again.';
      let details = null;
      if (error?.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          msg = 'You do not have permission to perform this action.';
        } else if (status === 404) {
          msg = 'The requested resource was not found.';
        } else if (status === 400 && error.response.data?.message) {
          msg = error.response.data.message;
        } else if (status >= 500) {
          msg = 'A server error occurred. Please try again later.';
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
    const { file: compressed, warning, error } = await compressImage(file, {
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
    if (type === 'profile') {
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
    if (type === 'profile') {
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
    setForm({ ...form, [e.target.name]: e.target.value });
    if (submitAttempted) setErrors({ ...errors, [e.target.name]: undefined });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setErrors({});
    setApiError('');
    setApiSuccess('');
    try {
      await organizationSchema.validateAsync(form, { abortEarly: false });
      // Build FormData
      const formData = new FormData();
      // Backend expects camelCase keys (see backend code)
      formData.append('organizationName', form.organization_name);
      formData.append('organizationShortName', form.organization_short_name);
      formData.append('organizationType', form.organization_type);
      formData.append('officialEmail', form.official_email);
      formData.append('officialWebsiteUrl', form.official_website_url);
      formData.append('address', form.address);
      formData.append('missionDescription', form.mission_description);
      formData.append('establishmentDate', form.establishment_date);
      formData.append('campusAffiliationScope', form.campus_affiliation_scope);
      formData.append('affiliatedSchoolsNames', form.affiliated_schools_names);
      formData.append('affiliatedDepartmentNames', form.affiliated_department_names);
      formData.append('primaryContactPersonName', form.primary_contact_person_name);
      formData.append('primaryContactPersonEmail', form.primary_contact_person_email);
      formData.append('primaryContactPersonPhone', form.primary_contact_person_phone);
      if (profileFile) formData.append('profilePicture', profileFile);
      if (coverFile) formData.append('coverPicture', coverFile);
      // Email is required for user creation (see backend)
      formData.append('email', form.official_email);
      mutation.mutate(formData);
    } catch (err) {
      if (err.isJoi && err.details) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          fieldErrors[d.path[0]] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Validation failed. Please check your input.' });
      }
    }
  };
  const handleCancel = () => {
    // Go back or reset
    window.history.back();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-[color:var(--color-background)] min-h-screen transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-[color:var(--color-primary-text)]">Add Organization</h2>
      <form onSubmit={handleSubmit} >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Organization Name */}
        <FormField
                label="Organization Name"
                name="organization_name"
                value={form.organization_name}
                onChange={handleChange}
                required
                error={submitAttempted ? errors.organization_name : undefined}
                />
                {/* Short Name */}
                <FormField
                label="Short Name"
                name="organization_short_name"
                value={form.organization_short_name}
                onChange={handleChange}
                error={submitAttempted ? errors.organization_short_name : undefined}
                />
                {/* Organization Type */}
                <FormField
                label="Organization Type"
                name="organization_type"
                value={form.organization_type}
                onChange={handleChange}
                required
                error={submitAttempted ? errors.organization_type : undefined}
                />
                {/* Official Email */}
                <FormField
                label="Official Email"
                name="official_email"
                type="email"
                value={form.official_email}
                onChange={handleChange}
                required
                error={submitAttempted ? errors.official_email : undefined}
                />
                {/* Official Website */}
                <FormField
                label="Official Website URL"
                name="official_website_url"
                type="url"
                value={form.official_website_url}
                onChange={handleChange}
                error={submitAttempted ? errors.official_website_url : undefined}
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
                name="mission_description"
                value={form.mission_description}
                onChange={handleChange}
                type="textarea"
                error={submitAttempted ? errors.mission_description : undefined}
                />
                {/* Establishment Date */}
                <FormField
                label="Establishment Date"
                name="establishment_date"
                type="date"
                value={form.establishment_date}
                onChange={handleChange}
                error={submitAttempted ? errors.establishment_date : undefined}
                />
                {/* Campus Affiliation Scope */}
                <FormField
                label="Campus Affiliation Scope"
                name="campus_affiliation_scope"
                value={form.campus_affiliation_scope}
                onChange={handleChange}
                placeholder="e.g. Main, East, West"
                error={submitAttempted ? errors.campus_affiliation_scope : undefined}
                />
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-xs text-[color:var(--color-secondary-text)] mt-4">
                Comma-separated for multiple values: Campus Affiliation Scope, Affiliated Schools, Affiliated Departments.
                </div>
                {/* Affiliated Schools */}
                <FormField
                label="Affiliated Schools Names"
                name="affiliated_schools_names"
                value={form.affiliated_schools_names}
                onChange={handleChange}
                placeholder="e.g. School of Science, School of Engineering"
                error={submitAttempted ? errors.affiliated_schools_names : undefined}
                />
                {/* Affiliated Departments */}
                <FormField
                label="Affiliated Department Names"
                name="affiliated_department_names"
                value={form.affiliated_department_names}
                onChange={handleChange}
                placeholder="e.g. Dept. of Physics, Dept. of Chemistry"
                error={submitAttempted ? errors.affiliated_department_names : undefined}
                />
                {/* Primary Contact Name */}
                <FormField
                label="Primary Contact Name"
                name="primary_contact_person_name"
                value={form.primary_contact_person_name}
                onChange={handleChange}
                required
                error={submitAttempted ? errors.primary_contact_person_name : undefined}
                />
                {/* Primary Contact Email */}
                <FormField
                label="Primary Contact Email"
                name="primary_contact_person_email"
                type="email"
                value={form.primary_contact_person_email}
                onChange={handleChange}
                required
                error={submitAttempted ? errors.primary_contact_person_email : undefined}
                />
                {/* Primary Contact Phone */}
                <FormField
                label="Primary Contact Phone"
                name="primary_contact_person_phone"
                value={form.primary_contact_person_phone}
                onChange={handleChange}
                required
                error={submitAttempted ? errors.primary_contact_person_phone : undefined}
                />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
            {/* Profile Image Upload */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col gap-2">
            <span className="text-sm text-[color:var(--color-secondary-text)]">Profile Picture</span>
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2">
                {profileImage ? (
                <img src={profileImage} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                <ProfileImage mediaId={null} size="xl" alt="Profile" className="w-full h-full" />
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={profileInputRef}
                onChange={e => handleImageChange(e, 'profile')}
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
                    onClick={() => handleRemoveImage('profile')}
                >
                    <FiX className="inline mr-1" /> Remove
                </button>
                )}
            </div>
            </div>
            {/* Cover Image Upload */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col gap-2">
            <span className="text-sm text-[color:var(--color-secondary-text)]">Cover Picture</span>
            <div className="w-full max-w-lg h-24 rounded overflow-hidden mb-2">
                {coverImage ? (
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                <CoverImage mediaId={null} alt="Cover" className="w-full h-full" />
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={coverInputRef}
                onChange={e => handleImageChange(e, 'cover')}
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
                    onClick={() => handleRemoveImage('cover')}
                >
                    <FiX className="inline mr-1" /> Remove
                </button>
                )}
            </div>
            </div>
            {/* Image UX messages */}
            {(errorMsg || warnMsg) && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                {warnMsg && <div className="text-yellow-600 text-xs mb-1">{warnMsg}</div>}
                {errorMsg && <div className="text-red-500 text-xs mb-1">{errorMsg}</div>}
                <div className="text-xs text-[color:var(--color-secondary-text)]">Max file size: {MAX_IMAGE_SIZE_MB}MB. Images will be automatically resized to {MAX_IMAGE_DIMENSION}px and compressed after upload.</div>
            </div>
            )}
        </div>
        {/* API error/success messages */}
        {(apiError || apiSuccess) && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2">
            {apiError && (
              <div className="text-red-600 text-sm mb-2">
                {apiError}
              </div>
            )}
            {apiSuccess && <div className="text-green-600 text-sm mb-2">{apiSuccess}</div>}
          </div>
        )}
        {/* Form Actions */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex gap-4 mt-4">
          <button
            type="submit"
            className="px-6 py-2 rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)] transition-colors"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded bg-[color:var(--color-muted)] text-[color:var(--color-primary-text)] font-medium hover:bg-[color:var(--color-surface)] transition-colors"
            onClick={handleCancel}
            disabled={mutation.isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddOrganizationPage; 