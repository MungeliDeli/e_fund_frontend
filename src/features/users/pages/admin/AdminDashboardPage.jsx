// AdminDashboardPage.jsx
// Dashboard for admins
import { useAuth } from '../../../../contexts/AuthContext';

function AdminDashboardPage() {
  const { user } = useAuth();
  const userType = user?.userType;

  // Helper to check if the current admin can see a section
  const canAccess = (roles) => {
    if (!roles) return true; // visible to all admins
    if (userType === 'super_admin') return true;
    return roles.includes(userType);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Welcome, {userType?.replace('_', ' ')}! This dashboard adapts to your admin role.</p>

      {/* User Management - super_admin, support_admin */}
      {canAccess(['super_admin', 'support_admin']) && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p>Manage users, view user lists, and perform support actions.</p>
        </section>
      )}

      {/* Campaign Approvals - super_admin, event_moderator */}
      {canAccess(['super_admin', 'event_moderator']) && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Campaign Approvals</h2>
          <p>Review and approve or reject campaign submissions.</p>
        </section>
      )}

      {/* Financial Reports - super_admin, financial_admin */}
      {canAccess(['super_admin', 'financial_admin']) && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Financial Reports</h2>
          <p>View and manage financial reports and transactions.</p>
        </section>
      )}

      {/* Settings - super_admin only */}
      {canAccess(['super_admin']) && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Platform Settings</h2>
          <p>Configure platform-wide settings and permissions.</p>
        </section>
      )}
    </div>
  );
}
export default AdminDashboardPage; 