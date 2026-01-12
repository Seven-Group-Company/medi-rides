'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, User, Mail, Shield } from 'lucide-react';

export default function OAuthSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const userId = searchParams.get('user_id');
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const role = searchParams.get('role');
  const isVerified = searchParams.get('is_verified') === 'true';
  const isNew = searchParams.get('is_new') === 'true';
  const redirectTo = searchParams.get('redirect_to');

  useEffect(() => {
    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_id', userId || '');
      localStorage.setItem('user_email', email || '');
      localStorage.setItem('user_name', name || '');
      localStorage.setItem('user_role', role || '');

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(redirectTo || '/customer-dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      router.push('/auth/error');
    }
  }, [accessToken, refreshToken, router, redirectTo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#E6F7FF] flex items-center justify-center">
      {/* your existing JSX unchanged */}
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-[#E6EAF0] p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0A2342] mb-2">
            {isNew ? 'Welcome to Compassionate Medi Rides!' : 'Welcome Back!'}
          </h2>
          
          <p className="text-[#64748B] mb-6">
            {isNew 
              ? 'Your account has been created successfully with Google.'
              : 'You have been successfully logged in with Google.'
            }
          </p>

          {/* User Info Card */}
          <div className="bg-[#F0F9FF] border border-[#B0D6FF] rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-[#0077B6]" />
              <span className="font-medium text-[#0A2342]">{decodeURIComponent(name || '')}</span>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Mail className="w-5 h-5 text-[#0077B6]" />
              <span className="text-[#64748B]">{email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-[#0077B6]" />
              <span className="text-[#64748B] capitalize">{role} Account</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-[#64748B]">
              Redirecting to your dashboard in {countdown} seconds...
            </div>
            
            <button
              onClick={() => router.push(redirectTo || '/customer-dashboard')}
              className="w-full py-3 px-4 bg-[#0077B6] text-white rounded-lg hover:bg-[#005A8F] transition-colors duration-200 font-medium"
            >
              Continue to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};