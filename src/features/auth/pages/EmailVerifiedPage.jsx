// EmailVerifiedPage.jsx
// This file defines the EmailVerifiedPage component for successful email verification.
// It displays confirmation messages and redirects users after email verification.
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../auth/services/authApi';

function EmailVerifiedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  // Extract token from query param
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification token.');
        return;
      }
      try {
        const res = await api.post('/verify-email', { token });
        // Store tokens if provided
        if (res.data?.data?.token) {
          localStorage.setItem('token', res.data.data.token);
        }
        if (res.data?.data?.refreshToken) {
          localStorage.setItem('refreshToken', res.data.data.refreshToken);
        }
        setStatus('success');
        setMessage('Your email has been verified and your account is now active! Redirecting to home...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } catch (err) {
        setStatus('error');
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage('Verification failed. The link may be invalid or expired.');
        }
      }
    }
    verifyEmail();
    // eslint-disable-next-line
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-4 py-12">
      <div className="flex flex-col items-center w-full max-w-md bg-[color:var(--color-background)] rounded-2xl shadow-lg p-8">
        <div className={`flex items-center justify-center w-20 h-20 rounded-full mb-6 ${status === 'success' ? 'bg-green-200' : status === 'error' ? 'bg-red-200' : 'bg-[color:var(--color-accent)]'}`}>
          {status === 'success' ? (
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <rect width="100%" height="100%" rx="12" fill="#22c55e" />
              <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : status === 'error' ? (
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <rect width="100%" height="100%" rx="12" fill="#ef4444" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <rect width="100%" height="100%" rx="12" fill="#007a35" />
              <path d="M6 8l6 5 6-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="4" y="6" width="16" height="12" rx="2" stroke="#fff" strokeWidth="2" />
            </svg>
          )}
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--color-primary-text)]">
          {status === 'success' ? 'Email Verified!' : status === 'error' ? 'Verification Failed' : 'Verifying...'}
        </h1>
        <p className="text-center text-[color:var(--color-secondary-text)] text-base mb-6">
          {message}
        </p>
        {status === 'error' && (
          <button
            onClick={() => navigate('/signup' , { replace: true })}
            className="w-full px-6 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition mt-2"
          >
            Return to Sign Up Page
          </button>
        )}
      </div>
    </div>
  );
}

export default EmailVerifiedPage; 