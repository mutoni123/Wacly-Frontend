import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// components/RouteGuard.tsx
export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
  
    useEffect(() => {
      if (!user && !pathname.includes('/login')) {
        router.push('/login');
      }
    }, [user, pathname, router]);
  
    return <>{children}</>;
  };