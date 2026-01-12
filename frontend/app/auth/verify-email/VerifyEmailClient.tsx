'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const VerifyEmailClient = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. The link may have expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const resendVerification = async () => {
    // This would typically require the user's email
    // For now, we'll show a message to contact support
    setMessage('Please contact support to resend the verification email.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#E6F7FF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-[#E6EAF0] p-8">
          <div className="text-center">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}

            <h2 className="text-2xl font-bold text-[#0A2342] mb-4">
              {status === 'loading' && 'Verifying Your Email'}
              {status === 'success' && 'Email Verified Successfully!'}
              {status === 'error' && 'Verification Failed'}
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#64748B] mb-6"
            >
              {message}
            </motion.p>

            {status === 'loading' && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">
                    Need help? Contact our support team
                  </span>
                </div>
                <button
                  onClick={resendVerification}
                  className="w-full py-3 px-4 border border-[#E6EAF0] rounded-lg text-[#0A2342] hover:bg-[#F5F7FA] transition-colors duration-200 font-medium"
                >
                  Resend Verification Email
                </button>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 text-center">
                    You can now log in to your account and start using our services.
                  </p>
                </div>
                <a
                  href="/auth"
                  className="block w-full py-3 px-4 bg-[#0077B6] text-white rounded-lg hover:bg-[#005A8F] transition-colors duration-200 font-medium text-center"
                >
                  Continue to Login
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailClient;