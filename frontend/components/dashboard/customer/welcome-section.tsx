// Welcome Section Component
import { motion } from 'framer-motion';
import { User } from '@/types/auth.types';
import { Calendar } from 'lucide-react';

interface WelcomeSectionProps {
  user: User | null;
}

export const WelcomeSection = ({ user }: WelcomeSectionProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {getGreeting()}, <span className="text-[#0A2342]">{user?.name || 'Guest'}</span>!
      </h1>
      <p className="text-gray-600 mb-4">
        Welcome back to your medical transportation dashboard
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Member since</span>
          <span className="font-medium text-gray-900 ml-2">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            }) : 'N/A'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};