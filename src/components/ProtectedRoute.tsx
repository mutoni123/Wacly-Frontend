// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({
                                           children,
                                           allowedRoles = [],
                                       }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (
            !isLoading &&
            isAuthenticated &&
            allowedRoles.length > 0 &&
            user &&
            !allowedRoles.includes(user.role.toLowerCase())
        ) {
            router.push('/unauthorized');
        }
    }, [isLoading, isAuthenticated, user, router, allowedRoles]);

    if (isLoading) {
        return <div>Loading...</div>; // Replace with your loading component
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role.toLowerCase())) {
        return null;
    }

    return <>{children}</>;
}