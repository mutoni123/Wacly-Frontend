'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

// Types
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserProfile {
  name: string;
  role: string;
  avatar?: string;
}

// Component
export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Mock data
  const user: UserProfile = {
    name: 'John Doe',
    role: 'Admin',
    avatar: '/avatar.png',
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Employees', href: '/employees', icon: UsersIcon },
    { name: 'Leave Requests', href: '/leave', icon: CalendarIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  // Effects
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      if (userMenu && !userMenu.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Component parts
  const CompanyLogo = () => (
    <div className="p-4 border-b border-blue-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white flex-shrink-0 overflow-hidden">
          <Image src="/logo.png" alt="Company Logo" width={40} height={40} className="object-cover" />
        </div>
        {(isOpen || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
            <span className="font-bold text-lg">Walcy Enterprises</span>
            <span className="text-xs text-blue-200">EMS</span>
          </motion.div>
        )}
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="flex-1 mt-4">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-3 hover:bg-blue-700 transition-colors ${
                pathname === item.href ? 'bg-blue-700' : ''
              }`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <item.icon className="w-6 h-6 shrink-0" aria-hidden="true" />
              {(isOpen || isMobile) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-4 whitespace-nowrap">
                  {item.name}
                </motion.span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  const UserProfile = () => (
    <div className="relative mt-auto border-t border-blue-700" id="user-menu">
      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-blue-700 transition-colors"
        aria-expanded={isUserMenuOpen}
        aria-controls="user-menu-dropdown"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" />
          ) : (
            <UserCircleIcon className="w-8 h-8 text-white" aria-hidden="true" />
          )}
        </div>
        {(isOpen || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="font-medium text-sm">{user.name}</span>
              <span className="text-xs text-blue-200">{user.role}</span>
            </div>
            <ChevronDownIcon className="w-5 h-5" aria-hidden="true" />
          </motion.div>
        )}
      </button>
      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 py-2 bg-blue-700 rounded-md shadow-lg"
            id="user-menu-dropdown"
          >
            <Link
              href="/profile"
              className="block px-4 py-2 hover:bg-blue-600 transition-colors"
              onClick={() => setIsUserMenuOpen(false)}
            >
              Account Settings
            </Link>
            <button
              onClick={() => {
                /* Add logout logic */
              }}
              className="w-full text-left px-4 py-2 text-red-300 hover:bg-red-700 hover:text-white transition-colors"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Show toggle icon only on large screens or when sidebar is closed on small screens */}
      {(!isOpen || !isMobile) && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-800 text-white rounded-md"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Overlay for small screens when sidebar is open */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -300 } : { width: '5rem' }}
            animate={isMobile ? { x: 0 } : { width: isOpen ? '16rem' : '5rem' }}
            exit={isMobile ? { x: -300 } : undefined}
            transition={{ duration: 0.3 }}
            className={`${
              isMobile ? 'fixed left-0 top-0 z-40' : 'sticky top-0'
            } h-screen bg-blue-800 text-white flex flex-col`}
          >
            <CompanyLogo />
            <Navigation />
            <UserProfile />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}