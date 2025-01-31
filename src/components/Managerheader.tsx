"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ManagerHeaderProps {
  userName?: string;
  onLogout?: () => void;
}

export default function ManagerHeader({ userName = 'Manager', onLogout }: ManagerHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call your logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Call the onLogout callback if provided
        if (onLogout) {
          onLogout();
        }
        // Redirect to login page
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left">
            Manager Dashboard
          </h1>
          <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center focus:outline-none px-4 py-2 rounded-md hover:bg-gray-100"
              >
                <span className="text-gray-700">{userName}</span>
                <svg 
                  className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {isOpen && (
                <>
                  {/* Overlay to capture clicks outside dropdown */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={closeDropdown}
                  />
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                      onClick={closeDropdown}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/team-management"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                      onClick={closeDropdown}
                    >
                      Team Management
                    </Link>
                    <Link 
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                      onClick={closeDropdown}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-150"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}