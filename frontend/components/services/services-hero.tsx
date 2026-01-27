'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, FerrisWheelIcon, Shield } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import BoltBookingModal from '../homepage/bookings/bolt-booking-modal';

const ServicesHero = () => {

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
    const handleBookingSuccess = (bookingData: any) => {
      console.log('Booking successful:', bookingData);
      alert(`Booking confirmed! Your booking ID is: ${bookingData.id}`);
    };

  return (
    <section className="w-full bg-white border-b border-[#E6EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A2342] leading-tight">
              Comprehensive Transportation Services
            </h1>
            
            <p className="text-xl text-[#0A2342] opacity-90 leading-relaxed">
              Safe, reliable medical and non-medical transportation designed for your comfort and peace of mind. 
              Serving patients, seniors, and individuals with mobility needs across our community.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#B0D6FF] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#0A2342]" />
                </div>
                <span className="text-[#0A2342] font-medium">Safe & Insured</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#B0D6FF] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#0A2342]" />
                </div>
                <span className="text-[#0A2342] font-medium">24/7 Service</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#B0D6FF] flex items-center justify-center">
                  <FerrisWheelIcon className="w-5 h-5 text-[#0A2342]" />
                </div>
                <span className="text-[#0A2342] font-medium">Wheelchair Accessible</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#B0D6FF] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#0A2342]" />
                </div>
                <span className="text-[#0A2342] font-medium">Easy Booking</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-[#B0D6FF] text-[#0A2342] px-8 py-4 font-semibold text-lg border-0 hover:bg-[#9BC9FF] transition-colors duration-200 flex items-center space-x-3"
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule Your Ride</span>
            </motion.button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-lg overflow-hidden">
              {/* Replace this path with your actual image path */}
              <Image
                src="/wcu/30191.jpg" // Update this path
                alt="Professional medical transportation service"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-semibold text-[#0A2342] mb-2">
                  Professional Medical Transport
                </h3>
                <p className="text-[#0A2342] opacity-80">
                  Our trained staff ensures safe, comfortable transportation for all medical appointments and procedures.
                </p>
              </div>
            </div>
            
            {/* Optional decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#B0D6FF] rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#B0D6FF] rounded-full opacity-20 -z-10"></div>
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      <BoltBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </section>
  );
};

export default ServicesHero;