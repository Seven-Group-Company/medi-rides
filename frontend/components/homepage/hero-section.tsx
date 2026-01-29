'use client';

import { motion } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import BoltBookingModal from './bookings/bolt-booking-modal';
import { Phone, Copy, Check } from 'lucide-react';

const HeroSection = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Phone number configuration - replace with your actual number
  const phoneConfig = {
    displayNumber: '+1 (907) 414-7664',
    telLink: 'tel:+19074147664',
    hours: '24/7'
  };

  // Handle phone booking click
  const handlePhoneBooking = useCallback(() => {
    // Check if on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, initiate call immediately
      window.location.href = phoneConfig.telLink;
    } else {
      // On desktop, show phone number modal
      setIsPhoneModalOpen(true);
    }
  }, [phoneConfig.telLink]);

  // Copy phone number to clipboard
  const copyPhoneNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(phoneConfig.displayNumber);
      setIsCopied(true);
      
      // Reset copy state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = phoneConfig.displayNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [phoneConfig.displayNumber]);

  // Handle call now button
  const handleCallNow = useCallback(() => {
    window.location.href = phoneConfig.telLink;
  }, [phoneConfig.telLink]);

  // Close phone modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPhoneModalOpen) {
        setIsPhoneModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPhoneModalOpen]);

  const handleBookingSuccess = (bookingData: any) => {
    console.log('Booking successful:', bookingData);
    alert(`Booking confirmed! Your booking ID is: ${bookingData.id}`);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-start overflow-hidden bg-gradient-to-br from-[#0A2342] via-[#1a365d] to-[#2d3748]">
        {/* Background Image with Enhanced Overlay */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: 'url("/photos/56475636.svg")',
              filter: 'brightness(0.9) contrast(0.8)'
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Services Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mb-8"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
                Transportation Services include <span className='text-[#9BC9FF]'>Taxi, and non emergency medical transportation.</span>
              </h2>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="flex gap-4 sm:flex-row my-3 items-start"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(155, 201, 255, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-gradient-to-r from-[#0A2342] to-[#0A2342] text-[#ffffff] cursor-pointer px-10 py-5 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 hover:from-[#8BBDFF] hover:to-[#5A98E5] shadow-lg shadow-[#9BC9FF]/20"
                  aria-label="Schedule a ride online"
                >
                  Schedule a Ride
                </motion.button>
                
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(155, 201, 255, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePhoneBooking}
                  className="bg-gradient-to-r from-[#0A2342] to-[#0A2342] text-[#ffffff] cursor-pointer px-10 py-5 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 hover:from-[#8BBDFF] hover:to-[#5A98E5] shadow-lg shadow-[#9BC9FF]/20 flex items-center gap-2"
                  aria-label="Call to book a ride"
                >
                  <Phone className="w-5 h-5" />
                  Call to Book
                </motion.button>
              </motion.div>
              
              <motion.h1
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-lg md:text-2xl text-white leading-tight mb-6 drop-shadow-lg"
              >
                Safe, Reliable Non-Emergency Medical Transportation, 
                Professional transportation solutions for all your needs
              </motion.h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BoltBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Phone Number Modal */}
      {isPhoneModalOpen && (
        <div 
          className="fixed inset-0 bg-black/40 bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={() => setIsPhoneModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#0A2342] to-[#1a365d] rounded-2xl p-8 max-w-md w-full border border-[#9BC9FF]/20 shadow-2xl"
          >
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#9BC9FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-[#9BC9FF]" />
                </div>
                <h3 
                  id="phone-modal-title"
                  className="text-2xl font-bold text-white mb-2"
                >
                  Call to Book
                </h3>
                <p className="text-white/80 mb-2">
                  Speak with our booking team to schedule your ride
                </p>
                <p className="text-sm text-white/60">
                  Available {phoneConfig.hours}
                </p>
              </div>

              <div className="mb-8">
                <a
                  href={phoneConfig.telLink}
                  onClick={handleCallNow}
                  className="text-4xl font-bold text-[#9BC9FF] hover:text-[#8BBDFF] transition-colors block mb-4"
                  aria-label={`Call ${phoneConfig.displayNumber}`}
                >
                  {phoneConfig.displayNumber}
                </a>
                <div className="flex justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyPhoneNumber}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    aria-label={isCopied ? "Phone number copied" : "Copy phone number"}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={phoneConfig.telLink}
                    onClick={handleCallNow}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Call now"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </motion.a>
                </div>
              </div>

              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors px-4 py-2"
                aria-label="Close phone number modal"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default HeroSection;