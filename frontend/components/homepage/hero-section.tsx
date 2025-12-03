'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import BoltBookingModal from './bookings/bolt-booking-modal';

const HeroSection = () => {
  const features = [
    "ALI",
    "APDD", 
    "IDD",
    "ISW"
  ];

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookingSuccess = (bookingData: any) => {
    console.log('Booking successful:', bookingData);
    // You can show a success message or redirect to a confirmation page
    alert(`Booking confirmed! Your booking ID is: ${bookingData.id}`);
  };

  return (
    <>
      <section className="relative h-screen flex items-center justify-start overflow-hidden bg-[#0A2342]">
        {/* Background Image with Overlay */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: 'url("/photos/56475636.svg")'
            }}
          />
          <div className="absolute inset-0 bg-white opacity-15" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#fff] leading-tight mb-6"
            >
              Safe, Reliable Non-Emergency Medical Transportation
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-[#fff] mb-8 leading-relaxed"
            >
              Professional rides for medical appointments, therapy visits, airport transfers, and more.
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-red-400 font-bold mb-8 leading-relaxed uppercase"
            >
              {features.join(" • ")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-[#0A2342] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 hover:bg-[#9BC9FF] border-2 border-white"
              >
                Schedule a Ride
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 hover:bg-white hover:text-[#0A2342] border-2 border-white"
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Quick Booking Notice */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
              className="text-sm text-gray-300 mt-6"
            >
              ✨ No account needed - Book instantly with just your name and phone number
            </motion.p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BoltBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default HeroSection;