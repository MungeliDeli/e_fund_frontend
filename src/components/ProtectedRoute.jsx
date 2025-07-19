import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute component for route guarding.
 * @param {ReactNode} element - The component to render if access is allowed.
 * @param {string|string[]} [requiredRole] - The required user role(s) for access (optional).
 * @returns {ReactNode}
 */
function ProtectedRoute({ element, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user?.userType)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return element;
}

export default ProtectedRoute; 