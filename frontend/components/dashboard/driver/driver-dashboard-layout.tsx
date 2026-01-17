'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DriverSidebar from './driver-sidebar';
import DriverHeader from './driver-header';

interface DriverDashboardLayoutProps {
  children: React.ReactNode;
}

export default function DriverDashboardLayout({ children }: DriverDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sidebar toggle via custom event
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    };
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen, isMobile]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main content area */}
<div className="transition-all duration-200 ease-in-out lg:ml-64">
        <DriverHeader toggleSidebar={() => setSidebarOpen(prev => !prev)} />
        
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="min-h-screen p-3 sm:p-4 md:p-5 lg:p-6"
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] lg:hidden"
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(false);
        }}
      />
      )}
    </div>
  );
}