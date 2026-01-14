'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

const ContactInfo = () => {
    const contactDetails = [
        {
            icon: <Phone className="w-6 h-6 text-blue-600" />,
            title: "Phone",
            content: "+1 (555) 123-4567",
            subContent: "Mon-Fri 8am-6pm",
            delay: 0.1
        },
        {
            icon: <Mail className="w-6 h-6 text-blue-600" />,
            title: "Email",
            content: "rides@compassionatemedi.com",
            subContent: "Quick Response",
            delay: 0.2
        },
        {
            icon: <MapPin className="w-6 h-6 text-blue-600" />,
            title: "Office",
            content: "123 Care Street",
            subContent: "Medical District, CA 90210",
            delay: 0.3
        },
        {
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            title: "Working Hours",
            content: "Mon-Sat: 6:00 AM - 10:00 PM",
            subContent: "Sunday: By Appointment",
            delay: 0.4
        }
    ];

    return (
        <div className="grid grid-cols-1">
            {contactDetails.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: item.delay }}
                    className="bg-white p-6 transition-shadow duration-300"
                >
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-gray-700 font-medium">{item.content}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.subContent}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ContactInfo;
