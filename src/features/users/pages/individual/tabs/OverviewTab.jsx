/**
 * OverviewTab Component
 * 
 * Displays the main profile information in a structured, readable format.
 * This tab shows different information based on whether the viewer is the
 * profile owner (private view) or a visitor (public view).
 * 
 * Key Features:
 * - Conditional display of public vs private information
 * - Structured layout using SectionCard components
 * - Edit navigation for profile owners
 * - Responsive design with proper spacing
 * - Privacy-aware data display
 * 
 * Props:
 * @param {Object} profile - User profile data object
 * @param {boolean} isOwner - Whether the current user owns this profile
 * 
 * @author FundFlow Team
 * @version 1.0.0
 */

import SectionCard from "../../../components/SectionCard";

function OverviewTab({ profile, isOwner }) {
  if (!profile) {
    return <div>No profile data available.</div>;
  }

  /**
   * Handle edit navigation for different sections
   * Navigates to the Account Settings tab with appropriate focus
   */
  const handleEdit = (section) => {
    // Navigate to account settings tab
    const url = new URL(window.location);
    url.searchParams.set('tab', 'account-settings');
    window.history.replaceState(null, '', url);
    
    // Could add section-specific focus logic here
    console.log(`Edit ${section} requested`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Personal Information Section */}
      <SectionCard 
        title="Personal Information" 
        isOwner={isOwner} 
        editable={isOwner}
        onEdit={() => handleEdit('personal information')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <div>
              <span className="text-sm text-[color:var(--color-secondary-text)]">Name</span>
              <p className="font-medium">
                {profile.firstName} {profile.lastName || ""}
              </p>
            </div>
            
            {/* Show email only to profile owner */}
            {isOwner && profile.email && (
              <div>
                <span className="text-sm text-[color:var(--color-secondary-text)]">Email</span>
                <p className="font-medium">{profile.email}</p>
              </div>
            )}
            
            {/* Show phone only to profile owner */}
            {isOwner && profile.phoneNumber && (
              <div>
                <span className="text-sm text-[color:var(--color-secondary-text)]">Phone</span>
                <p className="font-medium">{profile.phoneNumber}</p>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-3">
            {profile.gender && (
              <div>
                <span className="text-sm text-[color:var(--color-secondary-text)]">Gender</span>
                <p className="font-medium">{profile.gender}</p>
              </div>
            )}
            
            {profile.dateOfBirth && isOwner && (
              <div>
                <span className="text-sm text-[color:var(--color-secondary-text)]">Date of Birth</span>
                <p className="font-medium">{profile.dateOfBirth}</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Location Information Section */}
      <SectionCard 
        title="Location" 
        isOwner={isOwner} 
        editable={isOwner}
        onEdit={() => handleEdit('location')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Country and City */}
          <div className="space-y-3">
            {profile.country && (
              <div>
                <span className="text-sm text-[color:var(--color-secondary-text)]">Country</span>
                <p className="font-medium">{profile.country}</p>
              </div>
            )}
            
            {profile.city && (
              <div>
                <span className="text-sm text-[color:var(--color-secondary-text)]">City</span>
                <p className="font-medium">{profile.city}</p>
              </div>
            )}
          </div>

          {/* Address (private information) */}
          {isOwner && profile.address && (
            <div>
              <span className="text-sm text-[color:var(--color-secondary-text)]">Address</span>
              <p className="font-medium">{profile.address}</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Account Status Section (Owner Only) */}
      {isOwner && (
        <SectionCard 
          title="Account Status" 
          isOwner={isOwner} 
          editable={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-[color:var(--color-secondary-text)]">Email Verification</span>
              <p className={`font-medium ${profile.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                {profile.isEmailVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
            
            <div>
              <span className="text-sm text-[color:var(--color-secondary-text)]">Account Status</span>
              <p className={`font-medium ${profile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default OverviewTab; 