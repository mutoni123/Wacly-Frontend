// app/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Adminsidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
                                        children
                                    }: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!isLoading && isAuthenticated && user?.role.toLowerCase() !== 'admin') {
            router.push('/unauthorized');
            return;
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role.toLowerCase() !== 'admin') {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                    <Toaster />
                </div>
            </main>
        </div>
    );
}