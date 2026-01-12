'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Phone, Calendar, Menu, X, User, LogOut, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { getDashboardPath } = useRoleNavigation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', href: '/', icon: null, auth: false },
    { name: 'Services', href: '/services', icon: Calendar, auth: false },
    { name: 'Contact', href: '/contact', icon: Phone, auth: false },
    { name: 'Dashboard', href: '/customer-dashboard', icon: Settings, auth: true, role: 'CUSTOMER' },
    { name: 'Admin Panel', href: '/admin/dashboard', icon: Shield, auth: true, role: 'ADMIN' },
    { name: 'Driver Portal', href: '/driver-dashboard', icon: Car, auth: true, role: 'DRIVER' },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.auth) return true;
    if (!isAuthenticated) return false;
    if (item.role && user?.role !== item.role) return false;
    return true;
  });

  const getDashboardHref = () => {
    if (!user?.role) return '/auth';
    return getDashboardPath(user.role);
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-white'
      } border-b border-[#E6EAF0]`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-[#B0D6FF] flex items-center justify-center">
                <Car className="w-5 h-5 text-[#0A2342]" />
              </div>
              <span className="text-xl font-semibold text-[#0A2342]">
                Compassionate Medi Rides
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1.5 text-[#0A2342] hover:text-[#B0D6FF] transition-colors duration-200 font-medium"
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              // Loading state
              <div className="w-6 h-6 border-2 border-[#B0D6FF] border-t-transparent rounded-full animate-spin" />
            ) : isAuthenticated ? (
              // Authenticated user menu
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-[#F0F9FF] px-4 py-2 rounded-lg border border-[#E6EAF0] hover:border-[#B0D6FF] transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-[#B0D6FF] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#0A2342]">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-[#64748B] capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E6EAF0] py-1"
                    >
                      <Link
                        href={getDashboardHref()}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#0A2342] hover:bg-[#F0F9FF] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-[#0A2342] hover:bg-[#F0F9FF] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Unauthenticated state
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth"
                  className="bg-[#B0D6FF] text-white px-6 py-2.5 font-semibold transition-colors duration-200 hover:bg-[#9BC9FF] border-0 rounded-lg"
                >
                  Book a Ride
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#0A2342] hover:bg-gray-50 border-0 rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-[#E6EAF0]"
          >
            <div className="px-4 py-4 space-y-0">
              {/* Navigation Items */}
              {filteredNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 p-3 text-[#0A2342] hover:bg-gray-50 font-medium border-0 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Auth Section */}
              <div className="border-t border-[#E6EAF0] pt-4 mt-4">
                {isLoading ? (
                  <div className="flex justify-center p-3">
                    <div className="w-6 h-6 border-2 border-[#B0D6FF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 bg-[#F0F9FF] rounded-lg">
                      <div className="w-10 h-10 bg-[#B0D6FF] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0A2342]">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-sm text-[#64748B] capitalize">
                          {user?.role?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={getDashboardHref()}
                      className="flex items-center space-x-3 p-3 text-[#0A2342] hover:bg-gray-50 font-medium border-0 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 p-3 text-[#0A2342] hover:bg-gray-50 font-medium border-0 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 font-medium border-0 rounded-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth"
                      className="flex items-center justify-center space-x-2 p-3 text-[#0A2342] hover:bg-gray-50 font-medium border border-[#E6EAF0] rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-[#B0D6FF] text-white py-3 font-semibold border-0 rounded-lg"
                    >
                      <Link 
                        href="/auth" 
                        className="w-full block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Book a Ride
                      </Link>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;