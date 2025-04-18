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
  ChevronDownIcon,
  Bars3Icon,
  BriefcaseIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { UserProfile } from '@/components/UserProfile';
import { Clock } from 'lucide-react';

// Types
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavItem[];
}

interface NavItemProps {
  item: NavItem;
  depth?: number;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Employees',
      href: '/admin/employees/list',
      icon: UsersIcon,
      subItems: [
        {
          name: 'All Employees',
          href: '/admin/employees/list',
          icon: UserGroupIcon
        },
        {
          name: 'Departments',
          href: '/admin/employees/departments',
          icon: BriefcaseIcon
        },
      ],
    },
    {
      name: 'Leave Management',
      href: '/admin/leave',
      icon: CalendarIcon,
      subItems: [
        {
          name: 'Leave Requests',
          href: '/admin/leave/requests',
          icon: ClipboardDocumentListIcon
        },
        {
          name: 'Leave Types',
          href: '/admin/leave/types',
          icon: ClipboardDocumentListIcon
        },
      ],
    },
    {
      name: 'Attendance Management',
      href: '/admin/attendance',
      icon: Clock,
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSubmenu = (itemName: string) => {
    setExpandedItems(prev =>
        prev.includes(itemName)
            ? prev.filter(item => item !== itemName)
            : [...prev, itemName]
    );
  };

  const CompanyLogo = () => (
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex-shrink-0 overflow-hidden">
            <Image
                src="/logo.png"
                alt="Company Logo"
                width={40}
                height={40}
                className="object-cover"
            />
          </div>
          {(isOpen || isMobile) && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col"
              >
                <span className="font-bold text-lg">Wacly Enterprises</span>
                <span className="text-xs text-blue-200">EMS</span>
              </motion.div>
          )}
        </div>
      </div>
  );

  const NavItem: React.FC<NavItemProps> = ({ item, depth = 0 }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.name);

    return (
        <li>
          <Link
              href={item.href}
              className={`flex items-center px-4 py-3 hover:bg-blue-700 transition-colors cursor-pointer ${
                  pathname === item.href ? 'bg-blue-700' : ''
              } ${depth > 0 ? 'pl-8' : ''}`}
              onClick={() => hasSubItems && toggleSubmenu(item.name)}
          >
            <item.icon className="w-6 h-6 shrink-0" aria-hidden="true" />
            {(isOpen || isMobile) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-4 flex-1 flex items-center justify-between"
                >
                  <span className="whitespace-nowrap">{item.name}</span>
                  {hasSubItems && (
                      <ChevronDownIcon
                          className={`w-5 h-5 transform transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                          }`}
                      />
                  )}
                </motion.div>
            )}
          </Link>
          {hasSubItems && isExpanded && (isOpen || isMobile) && (
              <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-900"
              >
                {item.subItems?.map((subItem) => (
                    <NavItem key={subItem.href} item={subItem} depth={depth + 1} />
                ))}
              </motion.ul>
          )}
        </li>
    );
  };

  const Navigation = () => (
      <nav className="flex-1 mt-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
              <NavItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>
  );

  return (
      <>
        {(!isOpen || !isMobile) && (
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-800 text-white rounded-md"
                aria-label="Toggle sidebar"
            >
              <Bars3Icon className="w-6 h-6" aria-hidden="true" />
            </button>
        )}

        {isMobile && isOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setIsOpen(false)}
            />
        )}

        <AnimatePresence mode="wait">
          {(isOpen || !isMobile) && (
              <motion.div
                  initial={isMobile ? { x: -300 } : { width: '5rem' }}
                  animate={isMobile ? { x: 0 } : { width: isOpen ? '16rem' : '5rem' }}
                  exit={isMobile ? { x: -300 } : undefined}
                  transition={{ duration: 0.3 }}
                  className={`h-screen bg-blue-800 text-white flex flex-col ${
                      isMobile ? 'fixed left-0 top-0 z-40' : 'sticky top-0'
                  }`}
              >
                <CompanyLogo />
                <Navigation />
                <UserProfile isOpen={isOpen} isMobile={isMobile} />
              </motion.div>
          )}
        </AnimatePresence>
      </>
  );
}