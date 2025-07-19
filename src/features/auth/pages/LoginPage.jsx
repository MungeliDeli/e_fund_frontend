// LoginPage.jsx
// This file defines the LoginPage component for user authentication.
// It handles login form, validation, API calls, and token storage upon successful login.
import React, { useState } from 'react';
import FormField from '../../../components/FormField';
import GoogleIcon from '../../../assets/devicon_google.svg';
import { login as loginApi } from '../../auth/services/authApi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../../auth/services/authValidation';
import { useAuth } from '../../../contexts/AuthContext';

const initialState = {
  email: '',
  password: '',
};

function LoginPage() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError('');
  };

  const validate = () => {
    const { error } = loginSchema.validate(form, { abortEarly: false });
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
    setSubmitting(true);
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitting(false);
      return;
    }
    try {
      const res = await loginApi({ email: form.email, password: form.password });
      const data = res.data?.data;
      if (data?.token && data?.user) {
        login(data.user, data.token, data.refreshToken);
        if (data.user.userType === 'individual_user') {
          navigate('/dashboard', { replace: true });
        } else if (data.user.userType === 'organization_user') {
          navigate('/organizer/dashboard', { replace: true });
        } else if (data.user.userType === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setApiError('Login failed. Please try again.');
      }
      setForm(initialState);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        if (errorData?.errorCode === 'LOGIN_RATE_LIMITED') {
          setApiError('Too many login attempts. Please try again later.');
        } else if (errorData?.message) {
          setApiError(errorData.message);
        } else {
          setApiError('Login failed. Please try again.');
        }
      } else {
        setApiError('Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-2 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-[color:var(--color-background)] rounded-2xl shadow-[0_2px_16px_0_var(--color-shadow)] px-6 py-8 flex flex-col items-center"
      >
     
        <h2 className="text-2xl font-bold text-center mb-2">Log In</h2>
        <p className="text-center text-[color:var(--color-secondary-text)] text-sm mb-6">
          By continuing, you agree to our <a href="#" className="text-blue-600 underline">User Agreement</a> and acknowledge that you understand the <a href="#" className="text-blue-600 underline">Privacy Policy</a>.
        </p>
        <button
          type="button"
          className="flex items-center justify-center text-black w-full border border-[color:var(--color-muted)] rounded-full py-2 mb-4 bg-white hover:bg-gray-50 transition"
        >
          <img src={GoogleIcon} alt="Google" className="w-5 h-5 mr-2" />
          Continue with Google
        </button>
        <div className="flex items-center w-full my-4">
          <div className="flex-1 h-px bg-[color:var(--color-muted)]" />
          <span className="mx-2 text-[color:var(--color-secondary-text)] text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-[color:var(--color-muted)]" />
        </div>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          error={errors.email}
          placeholder="Email"
        />
        <div className="relative w-full mt-4">
          <FormField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
            error={errors.password}
            placeholder="Password"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-8 text-lg text-gray-500 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-between items-center text-sm mt-2 mb-4">
          <button
            type="button"
            className="text-blue-600 hover:underline mb-2 sm:mb-0"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password
          </button>
          <span>
            Don't have an account?{' '}
            <button
              type="button"
              className="text-blue-600 font-medium hover:underline"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </span>
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-full text-lg transition disabled:opacity-60"
          disabled={submitting}
        >
          Log In
        </button>
        {apiError && (
          <div className="w-full mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center text-sm font-medium">
            {apiError}
          </div>
        )}
      </form>
    </div>
  );
}

export default LoginPage; 