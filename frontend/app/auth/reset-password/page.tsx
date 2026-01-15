'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                router.push('/auth');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Token may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#E6F7FF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-[#E6EAF0] p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Password Reset Successful</h2>
                    <p className="text-[#64748B] mb-6">
                        Your password has been successfully updated. Redirecting to login...
                    </p>
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

                <div className="bg-white rounded-lg shadow-sm border border-[#E6EAF0] p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-[#0A2342] mb-2">Set New Password</h2>
                        <p className="text-[#64748B]">Please enter your new password below.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#0A2342] mb-2">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[#64748B]" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-[#E6EAF0] rounded-lg focus:turn"
                                    placeholder="Enter new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-[#64748B]" /> : <Eye className="h-5 w-5 text-[#64748B]" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#0A2342] mb-2">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[#64748B]" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-[#E6EAF0] rounded-lg focus:turn"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#0077B6] hover:bg-[#005A8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B0D6FF] transition-colors duration-200"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </motion.button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
