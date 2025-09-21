/**
 * AboutTab Component
 *
 * Displays comprehensive organizer information in a structured, beautiful format.
 * This tab shows all available organizer information in an aesthetically pleasing layout.
 *
 * Key Features:
 * - Comprehensive information display
 * - Structured layout using SectionCard components
 * - Beautiful visual hierarchy
 * - Responsive design with proper spacing
 * - Public-only design (no conditional rendering)
 *
 * Props:
 * @param {Object} organizer - Organizer profile data object
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

import SectionCard from "../../../components/SectionCard";
import {
  FiMail,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-row items-start gap-4 py-2">
      {Icon && (
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-[color:var(--color-secondary-text)]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-[color:var(--color-secondary-text)] block mb-1">
          {label}
        </span>
        <span className="text-sm text-[color:var(--color-text)] break-words block">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </span>
      </div>
    </div>
  );
}

function AboutTab({ organizer }) {
  if (!organizer) {
    return <div>No organizer data available.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Basic Information Section */}
      <SectionCard
        title="Organization Information"
        isOwner={false}
        editable={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoRow
              label="Organization Name"
              value={organizer.organizationName}
            />
            {organizer.organizationShortName && (
              <InfoRow
                label="Short Name"
                value={organizer.organizationShortName}
              />
            )}
            <InfoRow
              label="Organization Type"
              value={organizer.organizationType}
            />
            {organizer.establishmentDate && (
              <InfoRow
                label="Established"
                value={new Date(organizer.establishmentDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
                icon={FiCalendar}
              />
            )}
            {organizer.campusAffiliationScope && (
              <InfoRow
                label="Campus Scope"
                value={organizer.campusAffiliationScope}
                icon={FiUsers}
              />
            )}
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Official Email"
              value={organizer.officialEmail || organizer.email}
              icon={FiMail}
            />
            {organizer.officialWebsiteUrl && (
              <InfoRow
                label="Website"
                value={
                  <a
                    href={organizer.officialWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--color-primary)] hover:underline"
                  >
                    {organizer.officialWebsiteUrl}
                  </a>
                }
                icon={FiGlobe}
              />
            )}
            {organizer.address && (
              <InfoRow
                label="Address"
                value={organizer.address}
                icon={FiMapPin}
              />
            )}
          </div>
        </div>
      </SectionCard>

      {/* Mission Statement Section */}
      {organizer.missionDescription && (
        <SectionCard title="Mission Statement" isOwner={false} editable={false}>
          <div className="text-[color:var(--color-text)] leading-relaxed">
            {organizer.missionDescription}
          </div>
        </SectionCard>
      )}

      {/* Primary Contact Section */}
      {(organizer.primaryContactPersonName ||
        organizer.primaryContactPersonEmail ||
        organizer.primaryContactPersonPhone) && (
        <SectionCard title="Primary Contact" isOwner={false} editable={false}>
          <div className="space-y-4">
            {organizer.primaryContactPersonName && (
              <InfoRow
                label="Contact Person"
                value={organizer.primaryContactPersonName}
              />
            )}
            {organizer.primaryContactPersonEmail && (
              <InfoRow
                label="Email"
                value={organizer.primaryContactPersonEmail}
                icon={FiMail}
              />
            )}
            {organizer.primaryContactPersonPhone && (
              <InfoRow
                label="Phone"
                value={organizer.primaryContactPersonPhone}
              />
            )}
          </div>
        </SectionCard>
      )}

      {/* Verification Status Section */}
      <SectionCard title="Verification Status" isOwner={false} editable={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Verification */}
          <div className="flex items-center gap-3">
            {organizer.isEmailVerified ? (
              <FiCheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <FiXCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-sm text-[color:var(--color-secondary-text)]">
                Email Verification
              </div>
              <div
                className={`font-medium ${
                  organizer.isEmailVerified ? "text-green-600" : "text-red-600"
                }`}
              >
                {organizer.isEmailVerified ? "Verified" : "Not Verified"}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center gap-3">
            {organizer.isActive ? (
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
                  organizer.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {organizer.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          {/* Member Since */}
          {organizer.createdAt && (
            <div className="flex items-center gap-3">
              <FiClock className="w-5 h-5 text-[color:var(--color-secondary-text)]" />
              <div>
                <div className="text-sm text-[color:var(--color-secondary-text)]">
                  Member Since
                </div>
                <div className="text-[color:var(--color-text)] font-medium">
                  {new Date(organizer.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export default AboutTab;
