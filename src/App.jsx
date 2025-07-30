// App.jsx
// This file defines the main App component and routing configuration for the FundFlow application.
// It sets up the theme provider, router, and defines all application routes with appropriate layouts.
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./layout/MainLayout";
import HomePage from "./features/home/pages/HomePage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import EmailVerifiedPage from "./features/auth/pages/EmailVerifiedPage";
import LoginPage from "./features/auth/pages/LoginPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import OrganizerSetupPasswordPage from "./features/auth/pages/OrganizerSetupPasswordPage";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfilePage from "./features/users/pages/individual/UserProfilePage";
import OrganizerProfilePage from "./features/users/pages/individual/OrganizerProfilePage";
// Import the template and config
import ClassicHeroTemplate from "./features/campaigns/templates/ClassicHero/ClassicHeroTemplate";
import classicHeroConfig from "./features/campaigns/templates/ClassicHero/config";

// Lazy load role-specific dashboards, AccessDeniedPage, and NotFoundPage
const UserDashboardPage = lazy(() =>
  import("./features/home/pages/UserDashboardPage")
);
const OrganizerDashboardPage = lazy(() =>
  import("./features/campaigns/pages/OrganizerDashboardPage")
);
const AdminDashboardPage = lazy(() =>
  import("./features/users/pages/admin/AdminDashboardPage")
);
const OrganizerPanel = lazy(() =>
  import("./features/users/pages/admin/organizerPanel/OrganizerPanel")
);
const AccessDeniedPage = lazy(() =>
  import("./features/auth/pages/AccessDeniedPage")
);
const NotFoundPage = lazy(() => import("./features/auth/pages/NotFoundPage"));
const AddOrganizationPage = lazy(() =>
  import("./features/users/pages/admin/organizerPanel/AddOrganizationPage")
);
const CampaignPanel = lazy(() =>
  import("./features/campaigns/pages/admin/campaignPanel/campaignPanel")
);
const CampaignCategories = lazy(() =>
  import("./features/campaigns/pages/admin/campaignPanel/campaignCategories")
);
const TemplateSelector = lazy(() =>
  import("./features/campaigns/builder/TemplateSelector")
);
const CampaignBuilderPage = lazy(() =>
  import("./features/campaigns/builder/CampaignBuilderPage")
);

function AppRoutes() {
  const location = useLocation();

  const authRoutes = [
    "/signup",
    "/login",
    "/verify-email",
    "/email-verified",
    "/forgot-password",
    "/reset-password",
    "/template-preview",
    "/campaign-builder",
  ];
  const shouldHideMainLayout = authRoutes.includes(location.pathname);

  const LayoutWrapper = ({ children }) =>
    shouldHideMainLayout ? (
      <>{children}</>
    ) : (
      <MainLayout>{children}</MainLayout>
    );

  return (
    <LayoutWrapper>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            Loading page...
          </div>
        }
      >
        <Routes>
          {/* Public Routes: pleaser note that for all public routes you have to include it in the publicRoutes array in authContext.jsx or else it will be redirected to login wheneve you try to go to the route */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/template-preview"
            element={<ClassicHeroTemplate config={classicHeroConfig} />}
          />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/setup-account"
            element={<OrganizerSetupPasswordPage />}
          />
          {/* Catch-all for undefined public routes */}
          <Route path="*" element={<NotFoundPage />} />

          {/* Protected Routes (using ProtectedRoute) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={<UserDashboardPage />}
                requiredRole="individual_user"
              />
            }
          />
          {/* Single profile page for both owner and public view */}
          <Route
            path="/profile-view"
            element={
              <ProtectedRoute
                element={<UserProfilePage />}
                requiredRole="individual_user"
              />
            }
          />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          {/* Organizer profile routes */}
          <Route
            path="/organizer/profile-view"
            element={
              <ProtectedRoute
                element={<OrganizerProfilePage />}
                requiredRole="organization_user"
              />
            }
          />
          <Route path="/organizer/:userId" element={<OrganizerProfilePage />} />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute
                element={<OrganizerDashboardPage />}
                requiredRole="organization_user"
              />
            }
          />
          {/* Campaign Builder Routes */}
          <Route
            path="/campaign-templates"
            element={
              <ProtectedRoute
                element={<TemplateSelector />}
                requiredRole="organization_user"
              />
            }
          />
          <Route
            path="/campaign-builder"
            element={
              <ProtectedRoute
                element={<CampaignBuilderPage />}
                requiredRole="organization_user"
              />
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboardPage />}
                requiredRole={[
                  "super_admin",
                  "support_admin",
                  "event_moderator",
                  "financial_admin",
                ]}
              />
            }
          />
          <Route
            path="/admin/organizers"
            element={
              <ProtectedRoute
                element={<OrganizerPanel />}
                requiredRole={["super_admin", "support_admin"]}
              />
            }
          />
          <Route
            path="/admin/organizers/add"
            element={
              <ProtectedRoute
                element={<AddOrganizationPage />}
                requiredRole={["super_admin", "support_admin"]}
              />
            }
          />
          <Route
            path="/admin/campaigns"
            element={
              <ProtectedRoute
                element={<CampaignPanel />}
                requiredRole={["super_admin", "event_moderator"]}
              />
            }
          />
          <Route
            path="/admin/campaign-categories"
            element={
              <ProtectedRoute
                element={<CampaignCategories />}
                requiredRole={["super_admin", "event_moderator"]}
              />
            }
          />
          {/* ...other protected routes... */}
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          {/* Catch-all for undefined protected routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </LayoutWrapper>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
