// components/UserProfile.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface UserProfileProps {
    isOpen: boolean;
    isMobile: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, isMobile }) => {
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Debug user data
    useEffect(() => {
        console.log('Current user data:', user);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Early return if no user or incomplete data
    if (!user?.firstName || !user?.lastName) {
        console.log('Incomplete user data:', user);
        return null;
    }

    // Safe user display data
    const userDisplayData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role || 'User',
        department: user.department || 'No Department',
        initials: `${(user.firstName?.[0] || '')}${(user.lastName?.[0] || '')}`.toUpperCase(),
    };

    const handleLogout = async () => {
        try {
            setIsUserMenuOpen(false);
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="relative mt-auto border-t border-blue-700" id="user-menu" ref={menuRef}>
            <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center gap-3 p-4 hover:bg-blue-700 transition-colors"
                aria-expanded={isUserMenuOpen}
                aria-controls="user-menu-dropdown"
                aria-label="User menu"
            >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {userDisplayData.initials}
          </span>
                </div>
                {(isOpen || isMobile) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-1 items-center justify-between"
                    >
                        <div className="flex flex-col text-left overflow-hidden">
              <span className="font-medium text-sm truncate">
                {userDisplayData.fullName}
              </span>
                            <div className="flex flex-col text-xs text-blue-200">
                                <span className="truncate">{userDisplayData.role}</span>
                                <span className="truncate">{userDisplayData.department}</span>
                            </div>
                        </div>
                        <ChevronDownIcon
                            className={`w-5 h-5 transform transition-transform ${
                                isUserMenuOpen ? 'rotate-180' : ''
                            }`}
                            aria-hidden="true"
                        />
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
                        <div className="px-4 py-2 border-b border-blue-600">
                            <div className="text-sm font-medium">
                                {userDisplayData.fullName}
                            </div>
                            <div className="text-xs text-blue-200">{userDisplayData.department}</div>
                            <div className="text-xs text-blue-200">{userDisplayData.role}</div>
                        </div>
                        <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm hover:bg-blue-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            Account Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-700 hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};