'use client';

import { motion, Variants } from 'framer-motion';
import { 
  Shield, 
  Car, 
  Accessibility,
  Users,
  Settings,
  CheckCircle
} from 'lucide-react';

const FleetAccessibilityShowcase = () => {
  const features = [
    {
      icon: Accessibility,
      title: "Wheelchair Ramp Entry",
      description: "Low-floor ramps with anti-slip surfaces for safe boarding",
      image: "/fleet/2152019721.jpg"
    },
    {
      icon: Car,
      title: "Fully Accessible Vans",
      description: "Spacious interiors with dedicated wheelchair securement areas",
      image: "/fleet/2149908127.jpg"
    },
    {
      icon: Users,
      title: "Secure Interior Seating",
      description: "Medical-grade seating with integrated safety restraints",
      image: "/fleet/25274.jpg"
    },
    {
      icon: Settings,
      title: "Safety & Mobility Equipment",
      description: "Advanced securement systems and mobility assistance tools",
      image: "/fleet/37337.jpg"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
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
    <section className="w-full bg-white bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="mb-12">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4"
          >
            Fleet Accessibility Features
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-[#0A2342] max-w-3xl"
          >
            Our vehicles are designed for safe, comfortable, and fully accessible transportation for all mobility needs.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="bg-white border border-[#E6EAF0] group hover:border-[#B0D6FF] transition-colors duration-300"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden border-b border-[#E6EAF0]">
                <motion.div
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="w-full h-64 bg-gray-100"
                >
                  <div 
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${feature.image})` }}
                  />
                </motion.div>
                
                {/* Icon Overlay */}
                <div className="absolute top-4 left-4 bg-white p-2 border border-[#E6EAF0]">
                  <feature.icon className="w-5 h-5 text-[#0A2342]" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-[#0A2342]">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[#0A2342] text-opacity-80 leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                {/* Feature List */}
                <div className="flex items-center space-x-2 text-sm text-[#0A2342] text-opacity-70">
                  <CheckCircle className="w-4 h-4 text-[#B0D6FF] flex-shrink-0" />
                  <span>ADA Compliant</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mt-12 bg-[#B0D6FF] py-6 border border-[#B0D6FF]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-[#0A2342]" />
                <span className="text-lg font-medium text-[#0A2342]">
                  All vehicles meet ADA accessibility standards
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Accessibility className="w-6 h-6 text-[#0A2342]" />
                <span className="text-lg font-medium text-[#0A2342]">
                  Certified mobility equipment
                </span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default FleetAccessibilityShowcase;