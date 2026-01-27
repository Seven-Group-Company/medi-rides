'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import BoltBookingModal from './bookings/bolt-booking-modal';
import { Car, CheckCircle2, Clock, Shield } from 'lucide-react';

const HeroSection = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookingSuccess = (bookingData: any) => {
    console.log('Booking successful:', bookingData);
    alert(`Booking confirmed! Your booking ID is: ${bookingData.id}`);
  };

  const serviceFeatures = [
    { icon: <Shield />, text: "Licensed & Insured" },
    { icon: <Car />, text: "Wheelchair Accessible" },
    { icon: <Clock />, text: "On-Time Guarantee" },
    { icon: <CheckCircle2 />, text: "Trained Drivers" }
  ];

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
            {/* Main Heading */}


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
              className="flex flex-col sm:flex-row my-3 items-start"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(155, 201, 255, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-gradient-to-r from-[#0A2342] to-[#0A2342] text-[#ffffff] cursor-pointer px-10 py-5 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 hover:from-[#8BBDFF] hover:to-[#5A98E5] shadow-lg shadow-[#9BC9FF]/20"
              >
                Schedule a Ride
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
    </>
  );
};

export default HeroSection;