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

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-row items-center gap-4 py-1">
      <span className="text-sm text-[color:var(--color-secondary-text)] min-w-[140px]">{label}</span>
      <span className="text-sm text-[color:var(--color-text)] break-words">{value || <span className='text-gray-400'>—</span>}</span>
    </div>
  );
}

function OverviewTab({ profile, isOwner, goToAccountSettings }) {
  if (!profile) {
    return <div>No profile data available.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* General Information Section */}
      <SectionCard 
        title="General Information" 
        isOwner={isOwner} 
        editable={isOwner}
        onEdit={goToAccountSettings}
      >
        
        <div className="flex flex-col gap-1">
          <InfoRow label="First Name" value={profile.firstName} />
          <InfoRow label="Last Name" value={profile.lastName} />
          <InfoRow label="Gender" value={profile.gender} />
          {isOwner && profile.dateOfBirth && <InfoRow label="Date of Birth" value={profile.dateOfBirth} />}
          <InfoRow label="City/Country" value={[
            profile.city,
            profile.country
          ].filter(Boolean).join(", ")} />
        </div>
      </SectionCard>

      {/* Contact Details Section (private) */}
     
        <SectionCard 
          title="Contact Details" 
          isOwner={isOwner} 
          editable={isOwner}
          onEdit={goToAccountSettings}
        >
          <div className="flex flex-col gap-1">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Phone" value={profile.phoneNumber} />
            <InfoRow label="Address" value={profile.address} />
          </div>
        </SectionCard>
     

      {/* Activity Insight Section (private) */}
      {isOwner && (
        <SectionCard 
          title="Activity Insight" 
          isOwner={isOwner} 
          editable={false}
        >
          <div className="flex flex-col gap-1">
            <InfoRow label="Email Verification" value={profile.isEmailVerified ? 'Verified' : 'Not Verified'} />
            <InfoRow label="Account Status" value={profile.isActive ? 'Active' : 'Inactive'} />
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default OverviewTab; 