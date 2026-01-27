"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-neutral-200 bg-white">
        <h1 className="text-2xl font-semibold tracking-tight">NovaLink</h1>

        <div className="flex gap-6 text-neutral-700 text-sm">
          <a href="#features" className="hover:text-black transition">Features</a>
          <a href="#pricing" className="hover:text-black transition">Pricing</a>
          <a href="#contact" className="hover:text-black transition">Contact</a>
        </div>
      </nav>
    
    {/* Fixed background gradient */}
    <div className="min-h-screen w-full text-neutral-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black via-#001f3f to-#003366">
      {/* Hero Section */}
      <section className="w-full py-24 px-8 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-semibold tracking-tight max-w-3xl text-white"
        >
          Connect. Automate. Scale.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 text-lg max-w-xl text-neutral-300"
        >
          NovaLink is your unified AI workspace designed to streamline operations, boost productivity, and accelerate growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-10 flex gap-4"
        >
          <button className="px-6 py-3 text-base font-medium bg-white text-black rounded-md flex items-center hover:bg-neutral-200 transition">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <button className="px-6 py-3 text-base font-medium bg-transparent text-white border-white hover:bg-white hover:text-black rounded-md flex items-center transition">
            Learn More
          </button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 px-8 grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {[
          {
            title: "AI Automation",
            desc: "Automate repetitive workflows and free your team to focus on meaningful work.",
          },
          {
            title: "Unified Workspace",
            desc: "Bring tools, teams, and data into one seamless command center.",
          },
          {
            title: "Real‑time Analytics",
            desc: "Track performance and make smarter decisions instantly.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 border border-neutral-200 rounded-xl bg-white/10 backdrop-blur-sm text-white"
          >
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="mt-3 text-neutral-300">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
    </>
  );
}