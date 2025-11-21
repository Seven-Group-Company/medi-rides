'use client';

import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Hospital, 
  UserCheck, 
  Droplets, 
  Activity, 
  Brain, 
  Heart,
  Plane,
  Bus,
  Ticket,
  Calendar,
  Library,
  MapPin,
  Map
} from 'lucide-react';
import ServiceCard from './service-card';

const ServicesGrid = () => {
  const medicalServices = [
    { icon: Stethoscope, title: "Doctor's Appointments" },
    { icon: Hospital, title: "Non-Emergency Hospital Visits" },
    { icon: UserCheck, title: "Hospital Discharge" },
    { icon: Droplets, title: "Dialysis" },
    { icon: Activity, title: "Physical Therapy Rehabilitation" },
    { icon: Brain, title: "Stroke Rehabilitation" },
    { icon: Heart, title: "Pulmonary & Cardiac Rehabilitation" },
  ];

  const nonMedicalServices = [
    { icon: MapPin, title: "Any distance in and from the valley." },
    { icon: Plane, title: "Airports" },
    { icon: Map, title: "Long Distance Trips" },
    { icon: Bus, title: "Train or Bus Stations" },
    { icon: Ticket, title: "Sporting Events" },
    { icon: Calendar, title: "Special & Family Events" },
    { icon: Library, title: "Library or Museum Trips" },
  ];

  return (
    <section className="bg-[#F5F7FA] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Medical Transportation Column */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-[#0A2342] mb-8 text-center lg:text-left">
              Non-Emergency Medical Transportation
            </h2>
            <div className="space-y-0 border border-[#E6EAF0]">
              {medicalServices.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  icon={service.icon}
                  title={service.title}
                  index={index}
                />
              ))}
            </div>
          </motion.div>

          {/* Non-Medical Transportation Column */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-[#0A2342] mb-8 text-center lg:text-left">
              General Transportation & Personal Travel
            </h2>
            <div className="space-y-0 border border-[#E6EAF0]">
              {nonMedicalServices.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  icon={service.icon}
                  title={service.title}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;