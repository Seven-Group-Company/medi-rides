'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: string;
}

export default function EmptyState({ searchTerm, statusFilter }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
      <p className="text-gray-500">
        {searchTerm || statusFilter !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'You don\'t have any rides assigned yet'
        }
      </p>
    </motion.div>
  );
}