// Health Tips Component
import { motion } from 'framer-motion';
import { Shield, Heart, Thermometer, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const healthTips = [
  {
    title: 'Prepare for Your Appointment',
    description: 'Bring your medical cards, insurance information, and a list of current medications.',
    icon: Shield,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    title: 'Comfort Matters',
    description: 'Wear comfortable clothing and bring any necessary mobility aids or comfort items.',
    icon: Heart,
    color: 'bg-gradient-to-br from-pink-500 to-pink-600'
  },
  {
    title: 'Stay Hydrated',
    description: 'Bring water and stay hydrated, especially during longer trips in warmer weather.',
    icon: Thermometer,
    color: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  {
    title: 'Be Punctual',
    description: 'Be ready 15 minutes before your scheduled pickup time to ensure a smooth ride.',
    icon: Clock,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600'
  }
];

export const HealthTips = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Health & Safety Tips
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tips for a smooth and comfortable ride
          </p>
        </div>
        <div className="p-2 bg-white rounded-lg">
          <AlertCircle className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {healthTips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${tip.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};