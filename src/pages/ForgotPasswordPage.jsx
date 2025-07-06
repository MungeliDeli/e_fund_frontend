// ForgotPasswordPage.jsx
// This file defines the ForgotPasswordPage component for password recovery.
// It handles password reset requests, rate limiting, and provides user feedback.
import React, { useState, useEffect } from 'react';
import FormField from '../components/FormField';
import { api } from '../features/auth/services/authApi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Joi from 'joi';

// Validation schema for forgot password
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

function ForgotPasswordPage() {
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hasRequested, setHasRequested] = useState(false);
  const navigate = useNavigate();

  // Countdown timer for resend functionality
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Validate form data using Joi
  const validateForm = () => {
    const { error } = forgotPasswordSchema.validate(formData, { abortEarly: false });
    if (!error) return {};
    
    const fieldErrors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      fieldErrors[field] = detail.message;
    });
    return fieldErrors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear success message when user modifies the form
    if (success) {
      setSuccess('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setErrors({});
    setSuccess('');

    try {
      await api.post('/forgot-password', { email: formData.email });
      
      setSuccess('If an account with that email exists, a password reset link has been sent.');
      setHasRequested(true);
      setTimer(30); // 30 second cooldown
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle API errors
  const handleApiError = (err) => {
    if (axios.isAxiosError(err)) {
      const errorData = err.response?.data;
      
      if (errorData?.errorCode === 'PASSWORD_RESET_RATE_LIMITED') {
        setErrors({ email: 'Too many password reset requests. Please wait before trying again.' });
      } else if (errorData?.message) {
        // For security, show the same message regardless of whether email exists
        setSuccess('If an account with that email exists, a password reset link has been sent.');
      } else {
        setErrors({ email: 'Something went wrong. Please try again.' });
      }
    } else {
      setErrors({ email: 'Something went wrong. Please try again.' });
    }
  };

  // Get button text based on current state
  const getButtonText = () => {
    if (submitting) {
      return hasRequested ? 'Resending...' : 'Requesting...';
    }
    if (timer > 0) {
      return `Resend in ${timer}s`;
    }
    return hasRequested ? 'Resend reset link' : 'Request reset link';
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    return submitting || timer > 0 || !formData.email || Object.keys(errors).length > 0;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-2 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[color:var(--color-background)] rounded-2xl shadow-[0_2px_16px_0_var(--color-shadow)] px-8 py-10 flex flex-col items-center"
      >
        <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--color-primary-text)]">
          Forgot your password
        </h1>
        
        <p className="text-center text-[color:var(--color-secondary-text)] text-base mb-6">
          Please enter the email address you'd like your password reset information sent to
        </p>
        
        <FormField
          label="Enter email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
          placeholder="your@email.com"
          className="mb-4"
        />
        
        <button
          type="submit"
          className="w-full bg-[color:var(--color-primary)] hover:bg-[color:var(--color-accent)] text-white font-semibold py-3 rounded-full text-lg transition disabled:opacity-50 mb-2"
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </button>
        
        {success && (
          <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center text-sm font-medium mb-2">
            {success}
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

export default ForgotPasswordPage; 