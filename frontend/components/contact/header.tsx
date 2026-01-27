'use client';

import { motion } from 'framer-motion';

const ContactHeader = () => {
    return (
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <motion.div
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 z-0"
            >
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/photos/25184.jpg")',
                        filter: 'brightness(0.9) contrast(0.9)'
                    }}
                />
                <div className="absolute inset-0 bg-black/40" />
            </motion.div>

            {/* Content */}
            <div className="relative md:flex items-end justify-end z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-0 w-full text-left">
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-200 text-sm font-semibold mb-6 border border-blue-400/30 backdrop-blur-sm">
                        Contact Us
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-xl tracking-tight">
                        Get in <span className="text-[#9BC9FF]">Touch</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                        We're here to help with all your medical transportation needs. Reach out to us for bookings, inquiries, or support.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactHeader;