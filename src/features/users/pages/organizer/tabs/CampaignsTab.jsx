/**
 * CampaignsTab Component
 *
 * Displays campaigns created by the organizer.
 * This is a placeholder component for future implementation.
 *
 * Props:
 * @param {string} organizerId - The ID of the organizer
 *
 * @author FundFlow Team
 * @version 1.0.0
 */

function CampaignsTab({ organizerId }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-[color:var(--color-text)] mb-2">
          Campaigns
        </h3>
        <p className="text-[color:var(--color-secondary-text)] mb-6">
          Campaigns created by this organizer will be displayed here.
        </p>
        <div className="text-sm text-[color:var(--color-secondary-text)] italic">
          Coming soon...
        </div>
      </div>
    </div>
  );
}

export default CampaignsTab;
