'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Mail } from 'lucide-react';

const OAuthErrorClient = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Authentication failed. Please try again.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#E6F7FF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-[#E6EAF0] p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0A2342] mb-2">
            Authentication Error
          </h2>
          
          <p className="text-[#64748B] mb-6">
            {message}
          </p>

          <div className="space-y-4">
            <a
              href="/auth"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-[#E6EAF0] rounded-lg text-[#0A2342] hover:bg-[#F5F7FA] transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </a>
            
            <div className="p-4 bg-[#F0F9FF] border border-[#B0D6FF] rounded-lg">
              <p className="text-sm text-[#0A2342] text-center">
                Need help? Contact{' '}
                <a href="mailto:support@compassionatemedi.com" className="text-[#0077B6] font-medium">
                  support@compassionatemedi.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OAuthErrorClient;