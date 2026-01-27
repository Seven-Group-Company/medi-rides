'use client';

import { motion, Variants } from 'framer-motion';
import { 
  Stethoscope, 
  Hospital, 
  UserCheck, 
  Droplets, 
  Activity, 
  Brain, 
  Heart,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

const MedicalTransportOverview = () => {
  const medicalServices = [
        { icon: MapPin, 
      title: "Any distance in and from the valley.",
      description: "Flexible rides for local trips within the valley area"
    },
    {
      icon: Stethoscope,
      title: "Doctor's Appointments",
      description: "Timely transportation for routine checkups and specialist consultations"
    },
    {
      icon: Hospital,
      title: "Non-Emergency Hospital Visits",
      description: "Reliable transport for scheduled hospital procedures and visits"
    },
    {
      icon: UserCheck,
      title: "Hospital Discharge",
      description: "Safe ride home after medical procedures or hospital stays"
    },
    {
      icon: Droplets,
      title: "Dialysis",
      description: "Consistent, dependable transportation for regular dialysis treatments"
    },
    {
      icon: Activity,
      title: "Physical Therapy Rehabilitation",
      description: "Support for ongoing physical therapy and rehabilitation sessions"
    },
    {
      icon: Brain,
      title: "Stroke Rehabilitation",
      description: "Specialized transport for stroke recovery and therapy appointments"
    },
    {
      icon: Heart,
      title: "Pulmonary & Cardiac Rehabilitation",
      description: "Reliable service for cardiac and respiratory therapy needs"
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
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="mb-12">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4"
          >
            Non-Emergency Medical Transportation
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-[#0A2342] max-w-4xl"
          >
            Safe, reliable transportation for patients attending routine and specialized medical appointments.
          </motion.p>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#E6EAF0]"
        >
          {medicalServices.map((service, index) => (
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

      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full bg-[#B0D6FF] py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-[#0A2342]">
                Need safe transport for your next medical appointment?
              </h3>
            </div>
            <Link href="/auth" passHref
              className="bg-white text-[#0A2342] px-8 py-3 font-semibold text-lg border-0 hover:bg-[#F5F7FA] transition-colors duration-200 flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule Your Ride</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default MedicalTransportOverview;