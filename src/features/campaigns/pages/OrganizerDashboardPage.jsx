// OrganizerDashboardPage.jsx
// Dashboard for organizers
import React, { useState } from "react";
import { FiBell, FiUsers, FiFlag, FiBarChart } from "react-icons/fi";
import BroadcastNotificationModal from "../../notifications/components/BroadcastNotificationModal";

function OrganizerDashboardPage() {
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary-text)]">
          Organizer Dashboard
        </h1>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-md hover:bg-[color:var(--color-accent)] transition-colors"
        >
          <FiBell className="w-4 h-4" />
          Broadcast Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-muted)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-secondary-text)]">
                Active Campaigns
              </p>
              <p className="text-2xl font-bold text-[color:var(--color-primary-text)]">
                12
              </p>
            </div>
            <FiFlag className="w-8 h-8 text-[color:var(--color-primary)]" />
          </div>
        </div>

        <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-muted)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-secondary-text)]">
                Total Donations
              </p>
              <p className="text-2xl font-bold text-[color:var(--color-primary-text)]">
                $24,500
              </p>
            </div>
            <FiBarChart className="w-8 h-8 text-[color:var(--color-primary)]" />
          </div>
        </div>

        <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-muted)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-secondary-text)]">
                Subscribers
              </p>
              <p className="text-2xl font-bold text-[color:var(--color-primary-text)]">
                1,234
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-[color:var(--color-primary)]" />
          </div>
        </div>

        <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-muted)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-secondary-text)]">
                Notifications Sent
              </p>
              <p className="text-2xl font-bold text-[color:var(--color-primary-text)]">
                45
              </p>
            </div>
            <FiBell className="w-8 h-8 text-[color:var(--color-primary)]" />
          </div>
        </div>
      </div>

      <div className="bg-[color:var(--color-surface)] p-6 rounded-lg border border-[color:var(--color-muted)]">
        <h2 className="text-lg font-semibold text-[color:var(--color-primary-text)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-[color:var(--color-muted)] rounded-lg hover:bg-[color:var(--color-muted)] transition-colors">
            <FiFlag className="w-6 h-6 text-[color:var(--color-primary)] mb-2" />
            <h3 className="font-medium text-[color:var(--color-primary-text)]">
              Create Campaign
            </h3>
            <p className="text-sm text-[color:var(--color-secondary-text)]">
              Start a new fundraising campaign
            </p>
          </button>

          <button className="p-4 text-left border border-[color:var(--color-muted)] rounded-lg hover:bg-[color:var(--color-muted)] transition-colors">
            <FiUsers className="w-6 h-6 text-[color:var(--color-primary)] mb-2" />
            <h3 className="font-medium text-[color:var(--color-primary-text)]">
              Manage Contacts
            </h3>
            <p className="text-sm text-[color:var(--color-secondary-text)]">
              View and organize your contacts
            </p>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="p-4 text-left border border-[color:var(--color-muted)] rounded-lg hover:bg-[color:var(--color-muted)] transition-colors"
          >
            <FiBell className="w-6 h-6 text-[color:var(--color-primary)] mb-2" />
            <h3 className="font-medium text-[color:var(--color-primary-text)]">
              Send Notification
            </h3>
            <p className="text-sm text-[color:var(--color-secondary-text)]">
              Broadcast to all subscribers
            </p>
          </button>
        </div>
      </div>

      <BroadcastNotificationModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </div>
  );
}

export default OrganizerDashboardPage;
