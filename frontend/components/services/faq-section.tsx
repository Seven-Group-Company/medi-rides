'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How far in advance should I book my ride?",
      answer: "We recommend booking at least 24-48 hours in advance for non-urgent rides. For same-day service, call our dispatch team and we'll do our best to accommodate your needs based on availability."
    },
    {
      question: "What areas do you serve?",
      answer: "We serve the entire metropolitan area and surrounding communities. Our service area includes downtown, medical districts, suburban zones, and extended coverage to nearby regions. Check our service area map for specific coverage details."
    },
    {
      question: "Do you provide wheelchair accessible vehicles?",
      answer: "Yes, all our wheelchair accessible vehicles feature ramps or lifts, securement systems, and trained drivers. Please specify your accessibility needs when booking to ensure we assign the appropriate vehicle."
    },
    {
      question: "Can a family member or caregiver ride along?",
      answer: "Absolutely. We encourage companions to ride along, especially for medical appointments. There's no additional charge for one companion rider. Additional companions may require a larger vehicle, which we can arrange."
    },
    {
      question: "What is your cancellation policy?",
      answer: "You can cancel or reschedule your ride without penalty up to 2 hours before your scheduled pickup time. Late cancellations may incur a fee. We understand medical situations can change suddenly and will work with you in emergency situations."
    },
    {
      question: "How do you handle medical emergencies during transport?",
      answer: "All our drivers are trained in basic first aid and CPR. Vehicles are equipped with emergency supplies. In case of a medical emergency, drivers will contact emergency services immediately and provide assistance until help arrives."
    },
    {
      question: "Do you transport patients with oxygen or medical equipment?",
      answer: "Yes, we regularly transport patients with oxygen tanks, IV poles, and other medical equipment. Please inform us of your specific equipment needs during booking so we can ensure proper securement and space."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept most insurance plans (Medicaid, Medicare, private insurance), credit/debit cards, cash, checks, and payment plans. We also work with various community organizations and voucher programs."
    },
    {
      question: "Are your drivers background checked?",
      answer: "Yes, all drivers undergo comprehensive background checks, driving record reviews, and regular drug testing. They also receive specialized training in patient assistance, mobility support, and emergency procedures."
    },
    {
      question: "What if I need to make multiple stops?",
      answer: "We can accommodate multiple stops with advance notice. Additional stops may affect the total fare. For complex trips with multiple destinations, we recommend speaking with our dispatch team to arrange the most efficient routing."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-[#0A2342]"
          >
            Find answers to common questions about our transportation services.
          </motion.p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="border border-[#E6EAF0] bg-white"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-[#F5F7FA] transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-[#0A2342] pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#B0D6FF] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#B0D6FF] flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-4"
                >
                  <p className="text-[#0A2342] text-opacity-80 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 bg-[#F5F7FA] border border-[#E6EAF0] p-8 text-center"
        >
          <h3 className="text-2xl font-semibold text-[#0A2342] mb-4">
            Still have questions?
          </h3>
          <p className="text-[#0A2342] text-opacity-80 mb-6 max-w-2xl mx-auto">
            Our friendly customer service team is available 24/7 to answer your questions and help you book your ride.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#B0D6FF] text-[#0A2342] px-6 py-3 font-semibold border-0 hover:bg-[#9BC9FF] transition-colors duration-200"
            >
              Call Now: (555) 123-4567
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#0A2342] px-6 py-3 font-semibold border border-[#E6EAF0] hover:border-[#B0D6FF] transition-colors duration-200"
            >
              Send us a Message
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;