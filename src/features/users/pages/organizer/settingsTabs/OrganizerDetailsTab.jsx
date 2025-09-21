import React, { useState, useEffect } from "react";
import {
  FiEdit3,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import { PrimaryButton } from "../../../../../components/Buttons";
import ProfileImage from "../../../components/ProfileImage";
import CoverImage from "../../../components/CoverImage";
import { fetchPrivateOrganizationProfile } from "../../../services/usersApi";

function OrganizerDetailsTab({ onEditDetails }) {
  const [organizerData, setOrganizerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchPrivateOrganizationProfile();
        setOrganizerData(data.data);
        console.log(data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch organizer details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-[color:var(--color-secondary-text)] py-8">
        Loading organizer details...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!organizerData) {
    return (
      <div className="text-center text-[color:var(--color-secondary-text)] py-8">
        No organizer data found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
            Organization Profile
          </h2>
          <p className="text-[color:var(--color-secondary-text)] mt-1">
            Manage your organization information and settings
          </p>
        </div>
        <PrimaryButton
          icon={FiEdit3}
          onClick={onEditDetails}
          className="px-6 py-2"
        >
          Edit Details
        </PrimaryButton>
      </div>

      {/* Cover Image Section */}
      <div className="relative">
        <div className="h-48 w-full rounded-lg overflow-hidden border border-[color:var(--color-muted)]">
          <CoverImage
            imageUrl={organizerData.coverPictureUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Profile Picture Overlay */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[color:var(--color-background)] shadow-lg">
            <ProfileImage
              imageUrl={organizerData.profilePictureUrl}
              size="xl"
              alt="Profile"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Organization Info Card */}
      <div className="mt-12 bg-[color:var(--color-surface)] rounded-lg p-6 border border-[color:var(--color-muted)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[color:var(--color-primary-text)] mb-4">
                Basic Information
              </h3>

              {/* Organization Name */}
              <div className="mb-4">
                <label className="text-sm font-medium text-[color:var(--color-secondary-text)] block mb-1">
                  Organization Name
                </label>
                <div className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                  {organizerData.organizationName || "Not provided"}
                </div>
              </div>

              {/* Short Name */}
              {organizerData.organizationShortName && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-[color:var(--color-secondary-text)] block mb-1">
                    Short Name
                  </label>
                  <div className="text-[color:var(--color-primary-text)]">
                    {organizerData.organizationShortName}
                  </div>
                </div>
              )}

              {/* Organization Type */}
              <div className="mb-4">
                <label className="text-sm font-medium text-[color:var(--color-secondary-text)] block mb-1">
                  Organization Type
                </label>
                <div className="text-[color:var(--color-primary-text)]">
                  {organizerData.organizationType || "Not provided"}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                  Contact Information
                </h4>

                {/* Official Email */}
                <div className="flex items-center gap-3">
                  <FiMail className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
                  <div>
                    <div className="text-sm text-[color:var(--color-secondary-text)]">
                      Official Email
                    </div>
                    <div className="text-[color:var(--color-primary-text)]">
                      {organizerData.officialEmail ||
                        organizerData.email ||
                        "Not provided"}
                    </div>
                  </div>
                </div>

                {/* Website */}
                {organizerData.officialWebsiteUrl && (
                  <div className="flex items-center gap-3">
                    <FiGlobe className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
                    <div>
                      <div className="text-sm text-[color:var(--color-secondary-text)]">
                        Website
                      </div>
                      <a
                        href={organizerData.officialWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[color:var(--color-primary)] hover:underline"
                      >
                        {organizerData.officialWebsiteUrl}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                {organizerData.address && (
                  <div className="flex items-center gap-3">
                    <FiMapPin className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
                    <div>
                      <div className="text-sm text-[color:var(--color-secondary-text)]">
                        Address
                      </div>
                      <div className="text-[color:var(--color-primary-text)]">
                        {organizerData.address}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* Mission Description */}
            {organizerData.missionDescription && (
              <div>
                <h4 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-3">
                  Mission Statement
                </h4>
                <div className="text-[color:var(--color-primary-text)] leading-relaxed">
                  {organizerData.missionDescription}
                </div>
              </div>
            )}

            {/* Establishment & Campus Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                Organization Details
              </h4>

              {/* Establishment Date */}
              {organizerData.establishmentDate && (
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
                  <div>
                    <div className="text-sm text-[color:var(--color-secondary-text)]">
                      Established
                    </div>
                    <div className="text-[color:var(--color-primary-text)]">
                      {new Date(
                        organizerData.establishmentDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Campus Affiliation */}
              {organizerData.campusAffiliationScope && (
                <div className="flex items-center gap-3">
                  <FiUsers className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
                  <div>
                    <div className="text-sm text-[color:var(--color-secondary-text)]">
                      Campus Scope
                    </div>
                    <div className="text-[color:var(--color-primary-text)]">
                      {organizerData.campusAffiliationScope}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Contact */}
            {(organizerData.primaryContactPersonName ||
              organizerData.primaryContactPersonEmail ||
              organizerData.primaryContactPersonPhone) && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-[color:var(--color-primary-text)]">
                  Primary Contact
                </h4>

                {organizerData.primaryContactPersonName && (
                  <div>
                    <div className="text-sm text-[color:var(--color-secondary-text)]">
                      Contact Person
                    </div>
                    <div className="text-[color:var(--color-primary-text)] font-medium">
                      {organizerData.primaryContactPersonName}
                    </div>
                  </div>
                )}

                {organizerData.primaryContactPersonEmail && (
                  <div className="flex items-center gap-3">
                    <FiMail className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
                    <div>
                      <div className="text-sm text-[color:var(--color-secondary-text)]">
                        Email
                      </div>
                      <div className="text-[color:var(--color-primary-text)]">
                        {organizerData.primaryContactPersonEmail}
                      </div>
                    </div>
                  </div>
                )}

                {organizerData.primaryContactPersonPhone && (
                  <div>
                    <div className="text-sm text-[color:var(--color-secondary-text)]">
                      Phone
                    </div>
                    <div className="text-[color:var(--color-primary-text)]">
                      {organizerData.primaryContactPersonPhone}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="bg-[color:var(--color-surface)] rounded-lg p-6 border border-[color:var(--color-muted)]">
        <h3 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
          Account Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Verification Status */}
          <div className="flex items-center gap-3">
            {organizerData.isEmailVerified ? (
              <FiCheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <FiXCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-sm text-[color:var(--color-secondary-text)]">
                Email Status
              </div>
              <div
                className={`font-medium ${
                  organizerData.isEmailVerified
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {organizerData.isEmailVerified
                  ? "Verified"
                  : "Pending Verification"}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center gap-3">
            {organizerData.isActive ? (
              <FiCheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <FiXCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-sm text-[color:var(--color-secondary-text)]">
                Account Status
              </div>
              <div
                className={`font-medium ${
                  organizerData.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {organizerData.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-3">
            <FiClock className="w-5 h-5 text-[color:var(--color-secondary-text)]" />
            <div>
              <div className="text-sm text-[color:var(--color-secondary-text)]">
                Member Since
              </div>
              <div className="text-[color:var(--color-primary-text)] font-medium">
                {organizerData.createdAt
                  ? new Date(organizerData.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                      }
                    )
                  : "Not available"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDetailsTab;
