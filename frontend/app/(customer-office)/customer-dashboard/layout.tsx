'use client';

import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/protected-route';
import { User, MapPin, Clock, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerDashboardLayoutProps {
  children: React.ReactNode;
}

export default function CustomerDashboardLayout({
  children,
}: CustomerDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/customer-dashboard', icon: User },
    { name: 'Book a Ride', href: '/customer-dashboard/book-ride', icon: MapPin },
    { name: 'Ride History', href: '/customer-dashboard/ride-history', icon: Clock },
    { name: 'My Profile', href: '/customer-dashboard/profile', icon: User },
  ];

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <div className="min-h-screen bg-[#F8FBFF] flex">
        {/* Desktop Sidebar */}
        <div className="sticky top-0 hidden h-screen lg:flex lg:w-64 lg:flex-col bg-white">
          {/* Logo */}
              <img src="/logos/medi.png" alt="Logo" className='object-contain' />

          {/* User Info */}
          <div className="px-6 py-4 bg-[#F0F9FF]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#B0D6FF] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-[#0A2342]">{user?.name}</h2>
                <p className="text-sm text-[#64748B]">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-[#0A2342] hover:bg-[#F0F9FF] transition-colors duration-200 font-medium"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 bg-[#F0F9FF]">
            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-[#0A2342] hover:bg-[#E6F7FF] transition-colors duration-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white h-16 flex items-center justify-between px-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#0A2342]"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <img src="/logos/medi.png" alt="Logo" className='object-contain w-16 h-16' />
            </div>

            <div className="w-8 h-8 bg-[#F0F9FF] flex items-center justify-center">
              <User className="w-4 h-4 text-[#0A2342]" />
            </div>
          </header>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed inset-0 z-50 lg:hidden bg-white"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between h-16 px-4 bg-[#F0F9FF]">
                    <div className="flex items-center space-x-2">
                      <img src="/logos/medi.png" alt="Logo" className='object-contain w-16 h-16' />
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 text-[#0A2342]"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="px-4 py-6 bg-[#F0F9FF]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#B0D6FF] flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-medium text-[#0A2342]">{user?.name}</h2>
                        <p className="text-sm text-[#64748B]">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 px-2 py-6 space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 text-[#0A2342] hover:bg-[#F0F9FF] transition-colors duration-200 font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </a>
                      );
                    })}
                  </nav>

                  {/* Mobile Logout */}
                  <div className="p-4 bg-[#F0F9FF]">
                    <button
                      onClick={logout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-[#0A2342] hover:bg-[#E6F7FF] transition-colors duration-200 font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}