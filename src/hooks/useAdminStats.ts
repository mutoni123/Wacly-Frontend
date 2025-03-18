// hooks/useAdminStats.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE } from '@/lib/contsants';

interface AdminStats {
    onLeave: number;
    totalStaff: number;
    departments: number;
    pendingRequests: number;
}

interface User {
    id: string;
    role: string;
    department_id: string;
}

interface LeaveRequest {
    id: number;
    status: string;
    start_date: string;
    end_date: string;
}

interface Department {
    id: string;
    name: string;
    description: string;
    manager_id: string;
    employee_count: number;
    manager?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface UserResponse {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
}

interface LeaveResponse {
    success: boolean;
    data: LeaveRequest[];
}

interface DepartmentResponse {
    success: boolean;
    count: number;
    data: Department[];
}

export const useAdminStats = () => {
    const [stats, setStats] = useState<AdminStats>({
        onLeave: 0,
        totalStaff: 0,
        departments: 0,
        pendingRequests: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch all required data
                const [departmentsRes, usersRes, leavesRes] = await Promise.all([
                    fetch(`${API_BASE}/departments`, { headers }),
                    fetch(`${API_BASE}/users`, { headers }),
                    fetch(`${API_BASE}/leave-requests`, { headers })
                ]);

                const departmentsData = await departmentsRes.json() as DepartmentResponse;
                const usersData = await usersRes.json() as UserResponse;
                const leavesData = await leavesRes.json() as LeaveResponse;

                // Extract data using the correct structure
                const departments = departmentsData.success ? departmentsData.data : [];
                const users = usersData?.users || [];
                const leaves = leavesData?.data || [];

                // Calculate current leaves
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                const onLeave = leaves.filter((leave: LeaveRequest) => 
                    leave.status === 'Approved' && 
                    new Date(leave.start_date) <= now && 
                    new Date(leave.end_date) >= now
                ).length;

                // Calculate pending requests
                const pendingRequests = leaves.filter((leave: LeaveRequest) => 
                    leave.status === 'Pending'
                ).length;

                const newStats = {
                    onLeave,
                    totalStaff: users.length,
                    departments: departments.length,
                    pendingRequests
                };

                console.log('Departments Response:', departmentsData);
                console.log('Calculated Admin Stats:', newStats);

                setStats(newStats);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch dashboard statistics",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [toast]);

    return { stats, isLoading };
};