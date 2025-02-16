import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface UserProfileProps {
  isOpen: boolean;
  isMobile: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, isMobile }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  if (!user) return null;
  console.log('UserProfile - Current user:', user);

  return (
    <div className="relative mt-auto border-t border-blue-700" id="user-menu">
      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-blue-700 transition-colors"
        aria-expanded={isUserMenuOpen}
        aria-controls="user-menu-dropdown"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0">
          {user.avatar ? (
            <Image 
              src={user.avatar} 
              alt={user.name || 'User Avatar'} 
              width={32} 
              height={32} 
              className="rounded-full"
            />
          ) : (
            <UserCircleIcon className="w-8 h-8 text-white" aria-hidden="true" />
          )}
        </div>
        {(isOpen || isMobile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 items-center justify-between"
          >
            <div className="flex flex-col text-left">
              <span className="font-medium text-sm">{user.name || 'User'}</span>
              <span className="text-xs text-blue-200">{user.role || 'Role'}</span>
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
            className="absolute top-full left-0 w-full mt-2 py-2 bg-blue-700 rounded-md shadow-lg"
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
              onClick={async () => {
                await logout();
                setIsUserMenuOpen(false);
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
};
