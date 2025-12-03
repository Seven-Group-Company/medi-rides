'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DriverHeader from './driver-header';
import DriverSidebar from './driver-sidebar';

interface DriverDashboardLayoutProps {
  children: React.ReactNode;
}

export default function DriverDashboardLayout({ children }: DriverDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:pl-64">
        <DriverHeader />
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="min-h-screen p-4 sm:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}