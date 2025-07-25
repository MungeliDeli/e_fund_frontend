/**
 * AccountSettingsTab Component
 * 
 * Provides account management functionality for profile owners, including
 * image editing, profile information updates, and account settings.
 * This tab is only accessible to the profile owner.
 * 
 * Key Features:
 * - Profile and cover image editing
 * - Loading, error, and success state handling
 * - Integration with ProfileImageEditor component
 * - Automatic navigation after successful updates
 * - Form validation and error display
 * 
 * Props:
 * @param {Object} profile - Current user profile data
 * @param {Function} setProfile - Function to update profile state in parent
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import ProfileImageEditor from '../../../components/ProfileImageEditor';
import ProfileInfoEditor from '../../../components/ProfileInfoEditor';
import { uploadProfileImages, updateUserProfile } from '../../../services/usersApi';
import SectionCard from '../../../components/SectionCard';

function AccountSettingsTab({ profile, onProfileUpdate }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Mutation for handling profile image uploads
  const uploadImagesMutation = useMutation({
    mutationFn: uploadProfileImages,
    onSuccess: () => {
      setSuccess('Profile images updated successfully!');
      setError(null);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      // Redirect to overview tab after a brief delay
      setTimeout(() => {
        navigate('/profile-view?tab=overview');
      }, 1500);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to upload images. Please try again.';
      setError(errorMessage);
      setSuccess(null);
      console.error('Failed to upload images:', err);
    },
  });

  // Mutation for handling profile information updates
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      setSuccess('Profile information updated successfully!');
      setError(null);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      // Redirect to overview tab after a brief delay
      setTimeout(() => {
        navigate('/profile-view?tab=overview');
      }, 1500);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      setSuccess(null);
      console.error('Failed to update profile:', err);
    },
  });

  const handleImageUpload = (imageData) => {
    uploadImagesMutation.mutate(imageData);
  };

  const handleInfoSave = (data) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Display combined error and success messages */}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mt-2">{success}</div>}

      {/* Profile Image Editor Component */}
      <SectionCard title="Edit your profile photo" isOwner={true} editable={false}>
        <ProfileImageEditor
          profile={profile}
          onSave={handleImageUpload}
          loading={uploadImagesMutation.isPending}
        />
      </SectionCard>

      <SectionCard title="Edit your profile information" isOwner={true} editable={false}>
        <ProfileInfoEditor
          profile={profile}
          onSave={handleInfoSave}
          loading={updateProfileMutation.isPending}
        />
      </SectionCard>

      {/* Future sections for other account settings */}
      {/* 
        TODO: Add additional account settings sections:
        - Profile information editing
        - Password change
        - Privacy settings
        - Notification preferences
        - Account deletion
      */}
    </div>
  );
}

export default AccountSettingsTab; 