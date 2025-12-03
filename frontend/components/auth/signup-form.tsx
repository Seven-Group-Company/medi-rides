'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserCheck, CheckCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  const { register, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        role: formData.role,
      });

      setSignupSuccess(true);
      setMessage('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Registration failed. Please try again.' 
      });
    }
  };

  // Add success state rendering
  if (signupSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#0A2342] mb-2">
          Check Your Email
        </h2>
        <p className="text-[#64748B] mb-6">
          {message}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              setSignupSuccess(false);
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                role: 'CUSTOMER',
                agreeToTerms: false
              });
            }}
            className="w-full py-3 px-4 border border-[#E6EAF0] rounded-lg text-[#0A2342] hover:bg-[#F5F7FA] transition-colors duration-200 font-medium"
          >
            Back to Registration
          </button>
          <p className="text-sm text-[#64748B]">
            Didn't receive the email?{' '}
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: formData.email }),
                  });
                  
                  if (response.ok) {
                    setMessage('Verification email sent! Please check your inbox.');
                  } else {
                    setMessage('Failed to resend verification email. Please try again.');
                  }
                } catch (error) {
                  setMessage('Error resending verification email.');
                }
              }}
              className="text-[#0077B6] hover:text-[#005A8F] font-medium"
            >
              Resend verification
            </button>
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0A2342] mb-2">
          Create Your Account
        </h2>
        <p className="text-[#64748B]">
          Join thousands of patients and caregivers using our reliable transportation services.
        </p>
      </div>

      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-600">{errors.general}</p>
        </motion.div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#0A2342] mb-2">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-[#64748B]" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.name ? 'border-red-300' : 'border-[#E6EAF0]'
            } rounded-lg focus:ring-2 focus:ring-[#B0D6FF] focus:border-[#B0D6FF] transition-colors duration-200 disabled:opacity-50`}
            placeholder="Enter your full name"
          />
        </div>
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors.name}
          </motion.p>
        )}
      </div>

      {/* Email Field */}
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
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.email ? 'border-red-300' : 'border-[#E6EAF0]'
            } rounded-lg focus:ring-2 focus:ring-[#B0D6FF] focus:border-[#B0D6FF] transition-colors duration-200 disabled:opacity-50`}
            placeholder="Enter your email"
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors.email}
          </motion.p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[#0A2342] mb-2">
          Phone Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-[#64748B]" />
          </div>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.phone ? 'border-red-300' : 'border-[#E6EAF0]'
            } rounded-lg focus:ring-2 focus:ring-[#B0D6FF] focus:border-[#B0D6FF] transition-colors duration-200 disabled:opacity-50`}
            placeholder="(555) 123-4567"
          />
        </div>
        {errors.phone && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors.phone}
          </motion.p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#0A2342] mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-[#64748B]" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={`block w-full pl-10 pr-10 py-3 border ${
              errors.password ? 'border-red-300' : 'border-[#E6EAF0]'
            } rounded-lg focus:ring-2 focus:ring-[#B0D6FF] focus:border-[#B0D6FF] transition-colors duration-200 disabled:opacity-50`}
            placeholder="Create a password"
          />
          <button
            type="button"
            disabled={isLoading}
            className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-[#64748B] hover:text-[#0A2342]" />
            ) : (
              <Eye className="h-5 w-5 text-[#64748B] hover:text-[#0A2342]" />
            )}
          </button>
        </div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors.password}
          </motion.p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0A2342] mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-[#64748B]" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            className={`block w-full pl-10 pr-10 py-3 border ${
              errors.confirmPassword ? 'border-red-300' : 'border-[#E6EAF0]'
            } rounded-lg focus:ring-2 focus:ring-[#B0D6FF] focus:border-[#B0D6FF] transition-colors duration-200 disabled:opacity-50`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            disabled={isLoading}
            className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-[#64748B] hover:text-[#0A2342]" />
            ) : (
              <Eye className="h-5 w-5 text-[#64748B] hover:text-[#0A2342]" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors.confirmPassword}
          </motion.p>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start space-x-3">
        <input
          id="agreeToTerms"
          name="agreeToTerms"
          type="checkbox"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          disabled={isLoading}
          className="h-4 w-4 text-[#B0D6FF] focus:ring-[#B0D6FF] border-[#E6EAF0] rounded mt-1 disabled:opacity-50"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-[#64748B]">
          I agree to the{' '}
          <a href="/terms" className="text-[#0077B6] hover:text-[#005A8F] font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#0077B6] hover:text-[#005A8F] font-medium">
            Privacy Policy
          </a>
        </label>
      </div>
      {errors.agreeToTerms && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {errors.agreeToTerms}
        </motion.p>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full flex justify-center items-center space-x-3 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#0077B6] hover:bg-[#005A8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B0D6FF] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <UserCheck className="w-5 h-5" />
        )}
        <span className="font-semibold">
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </span>
      </motion.button>
    </form>
  );
};

export default SignupForm;