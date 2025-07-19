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
import ProfileImageEditor from '../../../components/ProfileImageEditor';
import { uploadProfileImages } from '../../../services/usersApi';

function AccountSettingsTab({ profile, setProfile }) {
  // Component state for managing upload process
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const navigate = useNavigate();

  /**
   * Handle profile image upload process
   * Manages the entire upload flow including API calls and state updates
   */
  const handleImageUpload = async (imageData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call the upload API with the provided image data
      const response = await uploadProfileImages({
        profileFile: imageData.profileFile,
        coverFile: imageData.coverFile
      });

      // Update the profile state with new data
      if (setProfile) {
        setProfile(response.data);
      }

      // Show success message
      setSuccess('Profile images updated successfully!');
      
      // Redirect to overview tab after a brief delay
      setTimeout(() => {
        navigate('/profile-view?tab=overview');
      }, 1500);

    } catch (err) {
      // Handle upload errors
      console.error('Failed to upload images:', err);
      setError(err.response?.data?.message || 'Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancellation of image editing
   * Resets any error/success states
   */
  const handleCancel = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Display error and success messages */}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      
      {/* Profile Image Editor Component */}
      <ProfileImageEditor
        profile={profile}
        onSave={handleImageUpload}
        onCancel={handleCancel}
        loading={loading}
      />
      
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