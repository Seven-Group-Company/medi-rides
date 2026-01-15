'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '@/services/auth.service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }

    // Handle password reset logic here
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#E6F7FF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-[#E6EAF0] p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A2342] mb-4">
              Check Your Email
            </h2>
            <p className="text-[#64748B] mb-6">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSubmitted(false)}
                className="w-full py-3 px-4 border border-[#E6EAF0] rounded-lg text-[#0A2342] hover:bg-[#F5F7FA] transition-colors duration-200 font-medium"
              >
                Back to Login
              </motion.button>
              <p className="text-sm text-[#64748B]">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#0077B6] hover:text-[#005A8F] font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#E6F7FF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Login */}
        <div className="text-center">
          <a
            href="/auth"
            className="inline-flex items-center text-sm text-[#0077B6] hover:text-[#005A8F] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </a>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E6EAF0] p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#0A2342] mb-2">
              Reset Your Password
            </h2>
            <p className="text-[#64748B]">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0A2342] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#64748B]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className={`block w-full pl-10 pr-3 py-3 border ${error ? 'border-red-300' : 'border-[#E6EAF0]'
                    } rounded-lg focus:ring-2 focus:ring-[#B0D6FF] focus:border-[#B0D6FF] transition-colors duration-200`}
                  placeholder="Enter your email"
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center space-x-3 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#0077B6] hover:bg-[#005A8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B0D6FF] transition-colors duration-200"
            >
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Send Reset Link</span>
            </motion.button>
          </form>

          {/* Support Contact */}
          <div className="mt-6 p-4 bg-[#F0F9FF] border border-[#B0D6FF] rounded-lg">
            <p className="text-sm text-[#0A2342] text-center">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@compassionatemedi.com" className="text-[#0077B6] font-medium">
                support@compassionatemedi.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;