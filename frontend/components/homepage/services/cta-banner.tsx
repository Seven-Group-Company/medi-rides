'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import BoltBookingModal from '../bookings/bolt-booking-modal';

const CTABanner = () => {

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

      const handleBookingSuccess = (bookingData: any) => {
    console.log('Booking successful:', bookingData);
    alert(`Booking confirmed! Your booking ID is: ${bookingData.id}`);
  };

  return (
    <section className="w-full bg-[#0A2342] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-8"
          >
            Ready to Schedule Your Ride?
          </motion.h2>
          
          <motion.button
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={() => setIsBookingModalOpen(true)}
            whileHover={{ backgroundColor: "#9BC9FF" }}
            className="bg-[#B0D6FF] text-[#0A2342] px-12 py-4 font-bold text-lg hover:bg-[#9BC9FF] transition-colors duration-200 border-0"
          >
            Book Now
          </motion.button>
        </div>
      </div>
            <BoltBookingModal
              isOpen={isBookingModalOpen}
              onClose={() => setIsBookingModalOpen(false)}
              onBookingSuccess={handleBookingSuccess}
            />
    </section>
  );
};

export default CTABanner;