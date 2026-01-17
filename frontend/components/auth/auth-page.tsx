'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './login-form';
import SignupForm from './signup-form';
import { Shield, Heart, Car, Users } from 'lucide-react';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const features = [
    {
      icon: Car,
      title: "Easy Booking",
      description: "Schedule rides in seconds with our streamlined booking system"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your personal and medical information is protected with enterprise-grade security"
    },
    {
      icon: Heart,
      title: "Medical-Grade Service",
      description: "Access specialized transportation for medical appointments and mobility needs"
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "24/7 customer service for patients, caregivers, and families"
    }
  ];

  return (
    <div className="">
      <div className="h-screen flex">
        
        {/* Left Column - Brand & Features */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:px-12 lg:py-12 bg-[#0A2342] text-white">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#B0D6FF] flex items-center justify-center">
              <Car className="w-6 h-6 text-[#0A2342]" />
            </div>
            <span className="text-xl font-semibold">Compassionate Medi Rides</span>
          </div>

          {/* Features */}
          <div className="max-w-md mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Welcome to Compassionate Medi Rides
              </h1>
              <p className="text-lg text-blue-100 opacity-90">
                Secure access to reliable medical and non-medical transportation services.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-[#B0D6FF] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-[#fff]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-blue-100 opacity-80 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Authentication Forms */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 lg:flex-none">
          <div className="mx-auto w-full max-w-md lg:w-96">
            
            {/* Mobile Brand */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-10 h-10 flex items-center justify-center">
                <Car className="w-6 h-6 text-[#0A2342]" />
              </div>
              <span className="text-xl font-semibold text-[#0A2342]">
                Compassionate Medi Rides
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white mb-8">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-4 text-center font-semibold transition-colors duration-200 ${
                    activeTab === 'login'
                      ? 'text-[#0A2342] border-b-2 border-[#B0D6FF]'
                      : 'text-[#64748B] hover:text-[#0A2342]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-4 text-center font-semibold transition-colors duration-200 ${
                    activeTab === 'signup'
                      ? 'text-[#0A2342] border-b-2 border-[#B0D6FF]'
                      : 'text-[#64748B] hover:text-[#0A2342]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Forms */}
            <div className="bg-white">
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LoginForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SignupForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Additional Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#64748B]">
                {activeTab === 'login' 
                  ? "Need help accessing your account? "
                  : "By creating an account, you agree to our "
                }
                {activeTab === 'login' ? (
                  <a href="/forgot-password" className="text-[#0077B6] hover:text-[#005A8F] font-medium">
                    Contact Support
                  </a>
                ) : (
                  <a href="/terms" className="text-[#0077B6] hover:text-[#005A8F] font-medium">
                    Terms of Service
                  </a>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;