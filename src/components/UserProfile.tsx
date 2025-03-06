// components/UserProfile.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
    ChevronDownIcon, 
    UserCircleIcon, 
    ArrowLeftOnRectangleIcon,
    
} from '@heroicons/react/24/outline';

interface UserProfileProps {
    isOpen: boolean;
    isMobile: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, isMobile }) => {
    const { user, logout, isLoading } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="relative mt-auto border-t border-blue-700 p-4">
                <div className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600/50 rounded-full" />
                    {(isOpen || isMobile) && (
                        <div className="flex-1">
                            <div className="h-4 bg-blue-600/50 rounded w-24 mb-2" />
                            <div className="h-3 bg-blue-600/50 rounded w-16" />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        try {
            setIsUserMenuOpen(false);
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Get user initials
    const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className="relative mt-auto border-t border-blue-700" ref={menuRef}>
            <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center gap-3 p-4 hover:bg-blue-700 transition-colors"
                aria-expanded={isUserMenuOpen}
            >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                        {userInitials}
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
                                {user.firstName} {user.lastName}
                            </span>
                            <div className="flex flex-col text-xs text-blue-200">
                                <span className="truncate capitalize">{user.role}</span>
                                <span className="truncate">{user.department}</span>
                            </div>
                        </div>
                        <ChevronDownIcon
                            className={`w-5 h-5 transform transition-transform ${
                                isUserMenuOpen ? 'rotate-180' : ''
                            }`}
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
                    >
                        <div className="px-4 py-2 border-b border-blue-600">
                            <div className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-blue-200">{user.email}</div>
                            <div className="text-xs text-blue-200">
                                <span className="capitalize">{user.role}</span>
                                {user.department && ` • ${user.department}`}
                            </div>
                        </div>

                        <Link
                            href={`/${user.role.toLowerCase()}/profile`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <UserCircleIcon className="w-4 h-4" />
                            Profile
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-red-700/20 hover:text-red-200 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                            Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};