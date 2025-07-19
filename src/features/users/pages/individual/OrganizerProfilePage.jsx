import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { FiCamera, FiUser } from "react-icons/fi";

// Placeholder tab components (replace with real ones later)
function ProfileOverviewTab() {
  return <div>Profile Overview (Organizer)</div>;
}
function DonationHistoryTab() {
  return <div>Donation History (Organizer)</div>;
}
function SubscribedCampaignsTab() {
  return <div>Subscribed Campaigns / Following (Organizer)</div>;
}
function MessagesThankYouTab() {
  return <div>Messages & Thank You Wall (Organizer)</div>;
}
function AccountSettingsTab() {
  return <div>Account Settings (Organizer)</div>;
}

/**
 * OrganizerProfilePage
 * Renders either the owner's private organizer profile or a public view,
 * depending on the route and logged-in user.
 */
function OrganizerProfilePage() {
  // userId is present for /users/:userId, undefined for /profile-view
  const { userId } = useParams();
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine if the viewer is the owner
  const isOwner = !userId || userId === loggedInUser?.userId;

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      if (isOwner) {
        // Fetch private organizer profile (owner)
        // TODO: Replace with real API call to /api/v1/auth/profile (organizer)
        setProfile({
          name: loggedInUser?.name || "Organizer Name",
          profilePhoto: null,
          coverPhoto: null,
          // ...other private fields
        });
      } else {
        // Fetch public organizer profile for userId
        // TODO: Replace with real API call to /api/v1/users/:userId/profile (organizer)
        setProfile({
          name: "Public Organizer",
          profilePhoto: null,
          coverPhoto: null,
          // ...other public fields
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [userId, loggedInUser, isOwner]);

  // If the logged-in user tries to view their own public profile, redirect to /organizer/profile-view
  useEffect(() => {
    if (userId && userId === loggedInUser?.userId) {
      navigate("/organizer/profile-view", { replace: true });
    }
  }, [userId, loggedInUser, navigate]);

  // Tabs: show all for owner, limited for public
  const tabs = isOwner
    ? [
        { label: "Profile Overview", component: <ProfileOverviewTab /> },
        { label: "Donation History", component: <DonationHistoryTab /> },
        { label: "Subscribed Campaigns", component: <SubscribedCampaignsTab /> },
        { label: "Messages & Thank You Wall", component: <MessagesThankYouTab /> },
        { label: "Account Settings", component: <AccountSettingsTab /> },
      ]
    : [
        { label: "Profile Overview", component: <ProfileOverviewTab /> },
        { label: "Donation History", component: <DonationHistoryTab /> },
        { label: "Subscribed Campaigns", component: <SubscribedCampaignsTab /> },
        { label: "Messages & Thank You Wall", component: <MessagesThankYouTab /> },
      ];
  const [activeTab, setActiveTab] = useState(0);

  if (loading || !profile) return <div>Loading...</div>;

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-[80vh]">
      {/* Cover Photo */}
      <div className="w-full max-w-4xl h-36 sm:h-44 md:h-52 lg:h-60 relative rounded-b-lg overflow-hidden bg-[color:var(--color-muted)] flex items-center justify-center">
        {/* Edit button only for owner */}
        {isOwner && (
          <button
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
            onClick={() => setActiveTab(tabs.length - 1)} // Go to Account Settings
            aria-label="Edit cover photo"
          >
            <FiCamera className="text-xl text-gray-700" />
          </button>
        )}
      </div>
      {/* Profile Photo */}
      <div className="relative -mt-14 sm:-mt-16 mb-2">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-[color:var(--color-muted)] flex items-center justify-center shadow-lg">
          {profile.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FiUser className="text-5xl text-gray-400" />
          )}
        </div>
        {/* Edit button only for owner */}
        {isOwner && (
          <button
            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
            onClick={() => setActiveTab(tabs.length - 1)}
            aria-label="Edit profile photo"
          >
            <FiCamera className="text-lg text-gray-700" />
          </button>
        )}
      </div>
      {/* Organizer Name */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-center px-2 break-words">{profile.name}</h2>
      {/* Tabs */}
      <div className="flex flex-row gap-2 sm:gap-6 border-b w-full max-w-3xl justify-start sm:justify-center mt-2 overflow-x-auto hide-scrollbar px-2 sm:px-0">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`py-3 px-2 sm:px-1 text-sm sm:text-base font-medium border-b-2 transition-colors duration-150 whitespace-nowrap ${
              idx === activeTab
                ? "border-[color:var(--color-primary)] text-[color:var(--color-primary)]"
                : "border-transparent text-gray-700 hover:text-[color:var(--color-primary)]"
            }`}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="w-full max-w-3xl min-h-[200px] mt-6 px-2 sm:px-0">
        {tabs[activeTab].component}
      </div>
    </div>
  );
}

export default OrganizerProfilePage; 