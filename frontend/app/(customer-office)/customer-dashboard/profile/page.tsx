'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { UpdateProfileData, ChangePasswordData } from '@/types/profile.types';
import { PasswordForm } from '@/components/dashboard/customer/profile/password-form';
import { ProfileHeader } from '@/components/dashboard/customer/profile/profile-header';
import { ProfileForm } from '@/components/dashboard/customer/profile/profile-form';
import { AccountStatus } from '@/components/dashboard/customer/profile/account-status';
import { motion } from 'framer-motion';
import { Mail, Phone, User } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { updateProfile, changePassword, error, loading } = useProfile();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [detailedError, setDetailedError] = useState('');

  useEffect(() => {
    if (error) {
      setDetailedError(error);
      console.error('Profile error details:', error);
    }
  }, [error]);

  const handleProfileUpdate = async (data: UpdateProfileData) => {
    try {
      console.log('Updating profile with data:', data);
      const result = await updateProfile(data);
      console.log('Profile update result:', result);
      
      updateUser(result.user);
      setSuccessMessage('Profile updated successfully!');
      setDetailedError('');
      setIsEditingProfile(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setDetailedError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (data: ChangePasswordData) => {
    try {
      await changePassword(data);
      setSuccessMessage('Password changed successfully!');
      setDetailedError('');
      setIsChangingPassword(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Password change failed:', err);
      setDetailedError(err.message || 'Failed to change password');
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white p-6">
          <p className="text-[#64748B]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#E6F7FF] p-4"
        >
          <p className="text-[#0077B6] font-medium">{successMessage}</p>
        </motion.div>
      )}

      {/* Error Message */}
      {detailedError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEF2F2] p-4"
        >
          <p className="text-[#DC2626] font-medium">{detailedError}</p>
        </motion.div>
      )}

      {/* Rest of your component remains the same */}
      <ProfileHeader
        user={user}
        isEditing={isEditingProfile}
        onEditToggle={() => setIsEditingProfile(!isEditingProfile)}
      />

      {isEditingProfile ? (
        <ProfileForm
          user={user}
          onSubmit={handleProfileUpdate}
          onCancel={() => {
            setIsEditingProfile(false);
            setDetailedError('');
          }}
        />
      ) : (
        <>
          {/* Profile Information Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-[#0A2342] mb-4">
              Personal Information
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: user.name, icon: <User /> },
                { label: 'Email Address', value: user.email, icon: <Mail /> },
                { label: 'Phone Number', value: user.phone || 'Not provided', icon: <Phone /> },
              ].map((field, index) => (
                <div key={index} className="flex items-center space-x-4 py-3">
                  <div className="text-[#64748B] text-lg">
                    {field.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#64748B]">
                      {field.label}
                    </p>
                    <p className="text-[#0A2342] font-medium">
                      {field.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Password Change Section */}
      {isChangingPassword ? (
        <PasswordForm
          onSubmit={handlePasswordChange}
          onCancel={() => {
            setIsChangingPassword(false);
            setDetailedError('');
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0A2342]">
                Password & Security
              </h3>
              <p className="text-[#64748B] mt-1">
                Change your password to keep your account secure
              </p>
            </div>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-[#0077B6] text-white font-medium hover:bg-[#005A8F] transition-colors duration-200"
            >
              Change Password
            </button>
          </div>
        </motion.div>
      )}

      <AccountStatus user={user as any} />

      {/* Additional Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-[#0A2342] mb-4">
          Additional Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F8FBFF] p-4">
            <h3 className="font-medium text-[#0A2342] mb-2">Email Preferences</h3>
            <p className="text-[#64748B] text-sm mb-3">
              Manage your email notifications and communication preferences
            </p>
            <button className="text-[#0077B6] font-medium hover:text-[#005A8F] transition-colors duration-200">
              Configure Preferences
            </button>
          </div>
          <div className="bg-[#F8FBFF] p-4">
            <h3 className="font-medium text-[#0A2342] mb-2">Privacy Settings</h3>
            <p className="text-[#64748B] text-sm mb-3">
              Control your privacy and data sharing settings
            </p>
            <button className="text-[#0077B6] font-medium hover:text-[#005A8F] transition-colors duration-200">
              Manage Privacy
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}