'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Download, 
  Trash2,
  X,
  MoreVertical,
  Send,
  Tag,
  Mail
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onStatusUpdate: (status: string) => Promise<void>;
  onExport: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BulkActions({
  selectedCount,
  onStatusUpdate,
  onExport,
  onClose,
  isOpen
}: BulkActionsProps) {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    setLoading(true);
    try {
      await onStatusUpdate(status);
      setShowActions(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'VALID', label: 'Mark as Valid', icon: CheckCircle, color: 'text-green-600' },
    { value: 'EXPIRING_SOON', label: 'Mark as Expiring Soon', icon: Clock, color: 'text-yellow-600' },
    { value: 'EXPIRED', label: 'Mark as Expired', icon: AlertCircle, color: 'text-red-600' },
    { value: 'RENEWAL_IN_PROGRESS', label: 'Mark as Renewal in Progress', icon: RefreshCw, color: 'text-blue-600' },
  ];

  const otherActions = [
    { label: 'Export Selected', icon: Download, action: onExport },
    { label: 'Send Reminders', icon: Send, action: () => alert('Reminders will be sent') },
    { label: 'Add Tags', icon: Tag, action: () => alert('Add tags dialog will open') },
    { label: 'Delete Selected', icon: Trash2, action: () => handleDelete(), color: 'text-red-600' },
  ];

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedCount} document(s)? This action cannot be undone.`)) {
      // Call delete API here
      console.log('Deleting', selectedCount, 'documents');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="relative"
        >
          {/* Main Bulk Actions Bar */}
          <div className="bg-blue-600 text-white rounded-xl px-6 py-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <span className="font-bold">{selectedCount}</span>
                </div>
                <span className="font-medium">{selectedCount} document(s) selected</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all flex items-center"
                >
                  <MoreVertical className="w-4 h-4 mr-2" />
                  Actions
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expanded Actions Menu */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status Updates */}
                      <div>
                        <h4 className="text-sm font-medium text-white text-opacity-90 mb-2">Update Status</h4>
                        <div className="space-y-2">
                          {statusOptions.map(option => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => handleStatusUpdate(option.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors flex items-center justify-between disabled:opacity-50"
                              >
                                <div className="flex items-center">
                                  <Icon className={`w-4 h-4 mr-3 ${option.color}`} />
                                  <span>{option.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Other Actions */}
                      <div>
                        <h4 className="text-sm font-medium text-white text-opacity-90 mb-2">Other Actions</h4>
                        <div className="space-y-2">
                          {otherActions.map(action => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.label}
                                onClick={action.action}
                                className="w-full px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <Icon className={`w-4 h-4 mr-3 ${action.color || 'text-white'}`} />
                                  <span>{action.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}