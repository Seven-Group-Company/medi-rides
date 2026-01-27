'use client';

import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowUp,
} from 'lucide-react';

const WebsiteFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Company Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-[#1E293B]">
              Compassionate Medi Rides
            </h3>
            <p className="text-[#64748B] leading-relaxed">
              Providing safe, reliable medical and non-medical transportation with compassion and professionalism.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-white px-3 py-1 rounded text-xs text-[#1E293B] border border-[#E2E8F0]">
                🛡️ Licensed & Insured
              </span>
              <span className="bg-white px-3 py-1 rounded text-xs text-[#1E293B] border border-[#E2E8F0]">
                ♿ ADA Compliant
              </span>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-[#1E293B]">
              Contact Info
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#0077B6]" />
                </div>
                <div>
                  <p className="text-[#1E293B] font-medium">+1 (907) 414-7664</p>
                  <p className="text-sm text-[#64748B]">24/7 Dispatch</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#0077B6]" />
                </div>
                <div>
                  <p className="text-[#1E293B] font-medium">rcompassionate@gmail.com</p>
                  <p className="text-sm text-[#64748B]">Quick Response</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#0077B6]" />
                </div>
                <div>
                  <p className="text-[#1E293B] font-medium">Wasilla</p>
                  <p className="text-sm text-[#64748B]">Alaska </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#0077B6]" />
                </div>
                <div>
                  <p className="text-[#1E293B] font-medium">24/7 Service</p>
                  <p className="text-sm text-[#64748B]">Emergency & Scheduled</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-[#1E293B]">
              Quick Links
            </h4>
            <nav className="space-y-2">
              {[
                { name: 'Medical Transport', href: '/services' },
                { name: 'Non-Medical Rides', href: '/services' },
                { name: 'Contact Us', href: '/contact' }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-[#64748B] hover:text-[#0077B6] transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Social Media & Newsletter */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-[#1E293B]">
              Connect With Us
            </h4>

            {/* Social Media Icons */}
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' }
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, backgroundColor: '#0077B6' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-center text-[#64748B] hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>

            {/* Back to Top */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-4 text-[#64748B] hover:text-[#0077B6] transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Back to Top</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 border-t border-[#E2E8F0]"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-[#64748B] text-sm">
              <p>
                © 2025 Compassionate Medi Rides. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-[#64748B] hover:text-[#0077B6] transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="/terms" className="text-[#64748B] hover:text-[#0077B6] transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;