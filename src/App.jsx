// App.jsx
// This file defines the main App component and routing configuration for the FundFlow application.
// It sets up the theme provider, router, and defines all application routes with appropriate layouts.
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import EmailVerifiedPage from "./pages/EmailVerifiedPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function AppRoutes() {
  const location = useLocation();
  // Only show MainLayout for main app pages
  if (location.pathname === '/verify-email') {
    return (
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    );
  }
  if (location.pathname === '/email-verified') {
    return (
      <Routes>
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
      </Routes>
    );
  }
  if (location.pathname === '/forgot-password') {
    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    );
  }
  if (location.pathname === '/reset-password') {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    );
  }
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
