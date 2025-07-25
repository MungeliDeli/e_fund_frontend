/**
 * ProfileImageEditor Component
 * 
 * A comprehensive image editing interface that allows users to upload, change,
 * and remove both profile and cover images. This component handles file selection,
 * preview generation, and integration with the backend upload API.
 * 
 * Key Features:
 * - Dual image editing (profile + cover photos)
 * - File selection with preview
 * - Remove functionality for both images
 * - Loading states during upload
 * - Integration with ProfileImage and CoverImage components
 * - Form validation and error handling
 * 
 * Props:
 * @param {Object} profile - Current user profile data
 * @param {Function} onSave - Callback when save is clicked with image data
 * @param {Function} onCancel - Callback when cancel is clicked
 * @param {boolean} loading - Loading state from parent component
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

import { useRef, useState } from 'react';
import SectionCard from './SectionCard';
import { FiUser } from "react-icons/fi";
import ProfileImage from './ProfileImage';
import CoverImage from './CoverImage';
import { compressImage } from '../../../utils/imageCompression';

const MAX_IMAGE_SIZE_MB = 10; // Allow up to 10MB
const WARN_IMAGE_SIZE_MB = 2; // Warn if over 2MB
const MAX_IMAGE_DIMENSION = 1024;

function ProfileImageEditor({ profile, onSave, loading }) {
  // State for managing selected files and previews
  const [profileImage, setProfileImage] = useState(profile?.profilePictureUrl || null);
  const [coverImage, setCoverImage] = useState(profile?.coverPictureUrl || null);
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  
  // State for tracking removal actions
  const [remProfile, setRemProfile] = useState(false);
  const [remCover, setRemCover] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [warnMsg, setWarnMsg] = useState(null);

  // Refs for file input elements
  const profileInputRef = useRef();
  const coverInputRef = useRef();

  /**
   * Handle profile image file selection
   * Creates a preview URL and stores the file for upload
   */
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
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
        setProfileFile(compressed);
        setProfileImage(URL.createObjectURL(compressed));
        setRemProfile(false); // Reset removal flag
      } catch (err) {
        setErrorMsg(err.message);
      }
    }
  };

  /**
   * Handle cover image file selection
   * Creates a preview URL and stores the file for upload
   */
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
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
        setCoverFile(compressed);
        setCoverImage(URL.createObjectURL(compressed));
        setRemCover(false); // Reset removal flag
      } catch (err) {
        setErrorMsg(err.message);
      }
    }
  };

  /**
   * Handle profile image removal
   * Clears the file and preview, sets removal flag
   */
  const handleRemoveProfile = () => {
    setProfileImage(null);
    setProfileFile(null);
    setRemProfile(true);
  };

  /**
   * Handle cover image removal
   * Clears the file and preview, sets removal flag
   */
  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverFile(null);
    setRemCover(true);
  };

  /**
   * Handle save action
   * Passes all image data to parent component for processing
   */
  const handleSave = () => {
    if (onSave) {
      onSave({
        profileFile: remProfile ? null : profileFile,
        coverFile: remCover ? null : coverFile,
        removeProfile: remProfile,
        removeCover: remCover,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* UI note about max file size and resizing */}
      <div className="text-xs text-[color:var(--color-secondary-text)] mb-2">
        Max file size: {MAX_IMAGE_SIZE_MB}MB. Images will be automatically resized to {MAX_IMAGE_DIMENSION}px and compressed after upload.
      </div>
      {warnMsg && <div className="text-yellow-600 text-xs mb-2">{warnMsg}</div>}
      {errorMsg && <div className="text-red-500 text-xs mb-2">{errorMsg}</div>}
      {/* Image editing interface */}
      <div className="flex sm:flex-row gap-6 items-center justify-start">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <span className="text-xs mb-1 text-[color:var(--color-secondary-text)]">Profile image</span>
          <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
            {profileImage ? (
              // Show preview of selected file
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              // Show current profile image or fallback
              <ProfileImage 
                mediaId={profile?.profilePictureMediaId}
                size="xl"
                alt="Profile"
                className="w-full h-full"
              />
            )}
          </div>
          {/* Hidden file input for profile image */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={profileInputRef}
            onChange={handleProfileChange}
          />
          {/* Action buttons for profile image */}
          <div className="flex gap-2">
            <button
              className="px-2 py-1 text-xs rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)]"
              onClick={() => profileInputRef.current?.click()}
              type="button"
            >
              Change picture
            </button>
            {profileImage && (
              <button
                className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 font-medium hover:bg-red-200"
                onClick={handleRemoveProfile}
                type="button"
              >
                remove
              </button>
            )}
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="flex flex-col items-center">
          <span className="text-xs mb-1 text-[color:var(--color-secondary-text)]">Cover image</span>
          <div className="w-32 h-20 rounded overflow-hidden mb-2">
            {coverImage ? (
              // Show preview of selected file
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              // Show current cover image or fallback
              <CoverImage 
                mediaId={profile?.coverPictureMediaId}
                height="h-20"
                alt="Cover"
                className="w-full"
              />
            )}
          </div>
          {/* Hidden file input for cover image */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={coverInputRef}
            onChange={handleCoverChange}
          />
          {/* Action buttons for cover image */}
          <div className="flex gap-2">
            <button
              className="px-2 py-1 text-xs rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)]"
              onClick={() => coverInputRef.current?.click()}
              type="button"
            >
              Change picture
            </button>
            {coverImage && (
              <button
                className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 font-medium hover:bg-red-200"
                onClick={handleRemoveCover}
                type="button"
              >
                remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save/Cancel Actions */}
      <div className="flex  mt-2">
        <button
          className="px-4 py-1 rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)] disabled:opacity-60"
          onClick={handleSave}
          disabled={loading}
          type="button"
        >
          {loading ? 'Uploading...' : 'Save'}
        </button>
       
      </div>
    </div>
  );
}

export default ProfileImageEditor; 