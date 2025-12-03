'use client';

import { motion } from 'framer-motion';

interface RidesHeaderProps {
  activeRidesCount: number;
}

export default function RidesHeader({ activeRidesCount }: RidesHeaderProps) {
  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rides</h1>
          <p className="text-gray-600 mt-1">Manage your assigned rides and schedules</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Active Rides</p>
            <p className="text-2xl font-bold text-blue-600">{activeRidesCount}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}