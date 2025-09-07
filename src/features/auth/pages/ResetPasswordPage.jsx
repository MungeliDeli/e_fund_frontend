// ResetPasswordPage.jsx
// This file defines the ResetPasswordPage component for setting new passwords.
// It handles password reset token validation and new password submission.
import React, { useState } from 'react';
import FormField from '../../../components/FormField';
import { resetPassword } from '../services/authApi';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { passwordSchema } from '../../auth/services/authValidation';

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  const validate = () => {
    const { error } = passwordSchema.validate({ password, confirmPassword, token }, { abortEarly: false });
    if (!error) return {};
    const fieldErrors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      fieldErrors[field] = detail.message;
    });
    return fieldErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setSubmitting(false);
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token.');
      setSubmitting(false);
      return;
    }
    try {
      await resetPassword({ token, password });
      setSuccess('Your password has been reset. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
   
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 401) {
          setError(err.response?.data?.message || 'Invalid or expired reset token.');
        } else {
          setError('Failed to reset password. Please try again.');
        }
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-2 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[color:var(--color-background)] rounded-2xl shadow-[0_2px_16px_0_var(--color-shadow)] px-8 py-10 flex flex-col items-center"
      >
        <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--color-primary-text)]">Reset your password</h1>
        <p className="text-center text-[color:var(--color-secondary-text)] text-base mb-6">
          Enter your new password below.
        </p>
        <div className="relative w-full mb-4">
          <FormField
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            error={errors.password}
            placeholder="New password"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-8 text-lg text-gray-500 focus:outline-none"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="relative w-full mb-4">
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            error={errors.confirmPassword}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-8 text-lg text-gray-500 focus:outline-none"
            onClick={() => setShowConfirmPassword(v => !v)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {!success && (
          <button
            type="submit"
            className="w-full bg-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)] text-white font-semibold py-3 rounded-full text-lg transition disabled:opacity-50 mb-2"
            disabled={submitting}
          >
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        )}
        {success && (
          <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center text-sm font-medium mb-2">
            {success}
          </div>
        )}
        {error && !success && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center text-sm font-medium mb-2">
            {error}
          </div>
        )}
        <button
          type="button"
          className="text-blue-600 font-medium hover:underline mt-4"
          onClick={() => navigate('/login')}
        >
          Back To Login
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage; 