import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../features/auth/services/authApi';

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [resendStatus, setResendStatus] = useState('idle'); // idle, sending, success, error
  const [resendMsg, setResendMsg] = useState('');
  const [timer, setTimer] = useState(60);

  // Countdown timer for resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = async () => {
    setResendStatus('sending');
    setResendMsg('');
    try {
      await api.post('/resend-verification', { email });
      setResendStatus('success');
      setResendMsg('A new verification email has been sent. Please check your inbox.');
      setTimer(60);
    } catch (err) {
      setResendStatus('error');
      if (err?.response?.data?.errorCode === 'RESEND_VERIFICATION_RATE_LIMITED') {
        setResendMsg('Too many resend verification requests. Please wait before trying again.');
      } else {
        setResendMsg(
          err?.response?.data?.message ||
          'Failed to resend verification email. Please try again later.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-4 py-12">
      <div className="flex flex-col items-center w-full max-w-md bg-[color:var(--color-background)] rounded-2xl shadow-[0_2px_16px_0_var(--color-shadow)] p-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[color:var(--color-accent)]">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
            <rect width="100%" height="100%" rx="12" fill="#007a35" />
            <path d="M6 8l6 5 6-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--color-primary-text)]">Verify your email address</h1>
        <p className="text-center text-[color:var(--color-secondary-text)] text-base mb-4">
          We have sent a verification link to <span className="font-semibold text-[color:var(--color-primary-text)]">{email}</span>.
        </p>
        <p className="text-center text-[color:var(--color-secondary-text)] text-base mb-6">
          Click on the link to complete the verification process.<br />
          You might need to <span className="font-semibold text-[color:var(--color-primary-text)]">check your spam folder</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mb-6">
          <button
            onClick={handleResend}
            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-semibold hover:bg-[color:var(--color-accent)] transition disabled:opacity-50"
            disabled={timer > 0 || resendStatus === 'sending'}
          >
            {timer > 0 ? `Resend email (${timer}s)` : resendStatus === 'sending' ? 'Sending...' : 'Resend email'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-transparent text-[color:var(--color-primary-text)] font-semibold text-base transition"
          >
            Return to Site &rarr;
          </button>
        </div>
        {resendStatus === 'success' && (
          <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center text-sm font-medium mb-2">
            {resendMsg}
          </div>
        )}
        {resendStatus === 'error' && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center text-sm font-medium mb-2">
            {resendMsg}
          </div>
        )}
        <p className="text-center text-xs text-[color:var(--color-secondary-text)] mt-2">
          You can reach us at if you have any questions.
        </p>
      </div>
    </div>
  );
}

export default VerifyEmailPage; 