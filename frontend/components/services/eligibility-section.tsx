'use client';

import { motion, Variants } from 'framer-motion';
import { Users, Stethoscope, Heart, Baby, FerrisWheelIcon } from 'lucide-react';

const EligibilitySection = () => {
  const eligibilityGroups = [
    {
      icon: Users,
      title: "Seniors & Elderly",
      description: "Transportation for older adults needing assistance to medical appointments and daily activities",
      needs: ["Mobility assistance", "Companion riders welcome", "Door-to-door service"]
    },
    {
      icon: FerrisWheelIcon,
      title: "Wheelchair Users",
      description: "Fully accessible transportation for manual and power wheelchair users",
      needs: ["ADA compliant vehicles", "Securement systems", "Ramp access"]
    },
    {
      icon: Stethoscope,
      title: "Medical Patients",
      description: "Reliable transport for ongoing medical treatments and specialist visits",
      needs: ["Dialysis patients", "Therapy visits", "Hospital discharges"]
    },
    {
      icon: Heart,
      title: "Individuals with Disabilities",
      description: "Specialized transportation for various physical and cognitive disabilities",
      needs: ["Trained drivers", "Patient assistance", "Safety protocols"]
    },
    {
      icon: Baby,
      title: "Pediatric Patients",
      description: "Safe transport for children and adolescents with medical needs",
      needs: ["Child safety seats", "Parent accompaniment", "Pediatric facilities"]
    },
    {
      icon: Users,
      title: "General Public",
      description: "Non-medical transportation for community members needing reliable rides",
      needs: ["Airport transfers", "Personal appointments", "Event transportation"]
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
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4"
          >
            Who We Serve
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-[#0A2342] max-w-3xl mx-auto"
          >
            Our transportation services are available to individuals and families across the community,
            with specialized support for those with medical and mobility needs.
          </motion.p>
        </div>

        {/* Eligibility Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {eligibilityGroups.map((group, index) => (
            <motion.div
              key={group.title}
              variants={itemVariants}
              className="bg-white border border-[#E6EAF0] p-6 hover:border-[#B0D6FF] transition-colors duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#F5F7FA] border border-[#E6EAF0] flex items-center justify-center">
                  <group.icon className="w-6 h-6 text-[#0A2342]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0A2342]">
                  {group.title}
                </h3>
              </div>

              <p className="text-[#0A2342] text-opacity-80 mb-4 leading-relaxed">
                {group.description}
              </p>

              <div className="space-y-2">
                {group.needs.map((need, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#B0D6FF] flex-shrink-0" />
                    <span className="text-sm text-[#0A2342] text-opacity-70">{need}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 bg-[#F5F7FA] border border-[#E6EAF0] p-6 text-center"
        >
          <p className="text-lg text-[#0A2342] font-medium">
            No one is turned away due to inability to pay. We work with community organizations to ensure access for all.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EligibilitySection;