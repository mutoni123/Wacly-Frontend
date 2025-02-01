'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link'; // Add this import

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-600 to-pink-200">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/10 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4 lg:px-8 xl:px-12 py-4 flex justify-between items-center max-w-7xl">
          {/* Logo & Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Image src="/logo.png" width={40} height={40} alt="EMS Logo" className="rounded-lg" />
            <span className="text-white font-bold text-xl font-sans">Wacly-hrms</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-12">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-white hover:text-purple-200 transition-colors font-medium text-lg"
                whileHover={{ scale: 1.05 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-16 6h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white/10 backdrop-blur-lg p-4"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2 text-white hover:bg-white/20 px-4 rounded font-medium"
              >
                {item.name}
              </a>
            ))}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 lg:px-8 xl:px-12 max-w-7xl">
        <div className="min-h-screen flex flex-col justify-center">
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16 py-20">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:w-1/2 text-center md:text-left lg:pr-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 font-sans tracking-tight leading-tight">
                Modern Employee Management
                <span className="block text-purple-200 text-2xl md:text-3xl lg:text-4xl mt-4 font-normal">
                  Built for Productivity
                </span>
              </h1>
              <p className="text-white/90 mb-8 text-lg lg:text-xl leading-relaxed font-light max-w-2xl">
                Transform your workplace with our comprehensive HR management solution. 
                Streamline attendance tracking, leave management, and performance evaluations 
                while fostering a more engaged and productive work environment.
              </p>
              <div className="space-y-6">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 transition-colors shadow-lg"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:w-1/2 mt-8 md:mt-0"
            >
              <div className="relative">
                <Image
                  src="/dashboard-preview.jpeg"
                  width={700}
                  height={500}
                  alt="Dashboard Preview"
                  className="rounded-xl shadow-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}