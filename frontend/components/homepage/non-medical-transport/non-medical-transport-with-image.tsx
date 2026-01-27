'use client';

import { motion, Variants } from 'framer-motion';
import { 
  MapPin, 
  Plane, 
  Train, 
  Bus, 
  Ticket, 
  Calendar, 
  Car,
  ShoppingCart,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

const NonMedicalTransportWithImage = () => {
  const nonMedicalServices = [
    {
      icon: MapPin,
      title: "Long-Distance Trips",
      description: "Comfortable travel for out-of-town visits and extended journeys"
    },
    {
      icon: Plane,
      title: "Airport Transportation",
      description: "Reliable airport transfers with ample time for check-in and security"
    },
    {
      icon: Train,
      title: "Train & Bus Station Rides",
      description: "Seamless connections to regional and national transportation hubs"
    },
    {
      icon: Ticket,
      title: "Sporting Events",
      description: "Convenient rides to games, matches, and sporting venues"
    },
    {
      icon: Calendar,
      title: "Special & Family Events",
      description: "Dependable transportation for weddings, celebrations, and gatherings"
    },
    {
      icon: BookOpen,
      title: "Library & Museum Visits",
      description: "Accessible rides for educational and cultural outings"
    },
    {
      icon: ShoppingCart,
      title: "Daily Errands & Personal Appointments",
      description: "Assistance with grocery shopping, banking, and personal tasks"
    },
    {
      icon: Car,
      title: "General Personal Transportation",
      description: "Flexible rides for any non-medical need or destination"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 14, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="w-full bg-white border-t border-b border-[#E6EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="mb-12">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4"
          >
            General & Non-Medical Transportation
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
            className="text-lg md:text-xl text-[#0A2342] max-w-4xl"
          >
            Convenient transportation for daily activities, special events, and long-distance travel.
          </motion.p>
        </div>

        {/* Content with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Grid - 2/3 width */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#E6EAF0]"
          >
            {nonMedicalServices.map((service, index) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                className="bg-white border-0 border-l-4 border-[#B0D6FF] hover:bg-[#F5F7FA] transition-colors duration-200 group"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <service.icon className="w-6 h-6 text-[#0A2342] group-hover:text-[#B0D6FF] transition-colors duration-200" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#0A2342] mb-2">
                        {service.title}
                      </h3>
                      <p className="text-[#0A2342] text-opacity-80 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Image Panel - 1/3 width */}
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="h-full border-2 border-white bg-gray-100 flex items-center justify-center">
              {/* Replace with actual non-medical transportation image */}
              <div 
                className="w-full h-full min-h-[600px] bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")'
                }}
              />
            </div>
          </motion.div>
        </div>

      </div>

      {/* Highlight Row - Value Proposition */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full bg-[#B0D6FF] py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-medium text-[#0A2342]"
          >
            Reliable everyday transportation—safe, flexible, and always on time.
          </motion.p>
        </div>
      </motion.div>

      {/* CTA Block */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full bg-[#0A2342] py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white">
                Need a ride for your next event or trip?
              </h3>
            </div>
            <Link href="/auth" passHref
              className="bg-white text-[#0A2342] px-8 py-3 font-semibold text-lg border-0 hover:bg-[#F5F7FA] transition-colors duration-200"
            >
              Book Your Ride
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default NonMedicalTransportWithImage;