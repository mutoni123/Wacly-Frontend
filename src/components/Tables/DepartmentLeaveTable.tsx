// components/Tables/DepartmentLeaveTable.tsx
import { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/contsants";

// Interfaces
interface Department {
    id: string;
    name: string;
    description: string;
    manager_id: string | null;
}

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    role: 'admin' | 'manager' | 'employee';
    department_id: string;
}

interface LeaveRequest {
    id: number;
    user_id: string;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    number_of_days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
    comments: string | null;
    action_by: string | null;
    action_at: string | null;
    created_at: string;
    updated_at: string;
}

interface DepartmentStats {
    department: string;
    departmentId: string;
    totalEmployees: number;
    onLeave: number;
    upcoming: number;
    coverage: number;
}

export function DepartmentLeaveTable() {
    const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');
    
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
    
            // Fetch all data
            const [departmentsRes, usersRes, leavesRes] = await Promise.all([
                fetch(`${API_BASE}/departments`, { headers }),
                fetch(`${API_BASE}/users`, { headers }),
                fetch(`${API_BASE}/leave-requests`, { headers })
            ]);
    
            // Parse responses
            const departmentsData = await departmentsRes.json();
            const usersData = await usersRes.json();
            const leavesData = await leavesRes.json();
    
            console.log('Raw API Responses:', {
                departments: departmentsData,
                users: usersData,
                leaves: leavesData
            });
    
            // Extract data based on different response structures
            const departments = Array.isArray(departmentsData) ? departmentsData : [];
            const users = usersData?.users || []; // Extract from paginated response
            const leaves = leavesData?.data || [];
    
            console.log('Extracted Data:', {
                departments,
                users,
                leaves
            });
    
            // Filter employees
            const employees = users.filter(user => {
                const isEmployee = user?.role?.toLowerCase() === 'employee';
                const hasDepartment = Boolean(user?.department_id);
                console.log('Processing user:', {
                    id: user?.id,
                    role: user?.role,
                    department_id: user?.department_id,
                    isEmployee,
                    hasDepartment
                });
                return isEmployee && hasDepartment;
            });
    
            // Filter approved leaves
            const approvedLeaves = leaves.filter(leave => leave.status === 'Approved');
    
            console.log('Filtered Data:', {
                departmentsCount: departments.length,
                employeesCount: employees.length,
                approvedLeavesCount: approvedLeaves.length
            });
    
            // Calculate department statistics
            const stats = departments.map((dept) => {
                const departmentUsers = employees.filter(emp => emp.department_id === dept.id);
                
                console.log(`Department ${dept.name}:`, {
                    id: dept.id,
                    totalUsers: departmentUsers.length,
                    users: departmentUsers.map(u => ({
                        id: u.id,
                        role: u.role,
                        department_id: u.department_id
                    }))
                });
    
                const departmentLeaves = approvedLeaves.filter(leave => 
                    departmentUsers.some(user => user.id === leave.user_id)
                );
    
                const totalEmployees = departmentUsers.length;
    
                // Calculate current leaves
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                const onLeave = departmentLeaves.filter(leave => {
                    const startDate = new Date(leave.start_date);
                    const endDate = new Date(leave.end_date);
                    return startDate <= now && endDate >= now;
                }).length;
    
                // Calculate upcoming leaves
                const nextWeek = new Date(now);
                nextWeek.setDate(nextWeek.getDate() + 7);
                nextWeek.setHours(23, 59, 59, 999);
                
                const upcoming = departmentLeaves.filter(leave => {
                    const startDate = new Date(leave.start_date);
                    return startDate > now && startDate <= nextWeek;
                }).length;
    
                const coverage = totalEmployees > 0 
                    ? Math.round(((totalEmployees - onLeave) / totalEmployees) * 100)
                    : 100;
    
                return {
                    department: dept.name.trim(),
                    departmentId: dept.id,
                    totalEmployees,
                    onLeave,
                    upcoming,
                    coverage
                };
            });
    
            console.log('Final Department Stats:', stats);
            setDepartmentStats(stats);
    
        } catch (error) {
            console.error('Error in fetchData:', error);
            toast({
                title: "Error",
                description: "Failed to fetch department statistics",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-full h-12 bg-muted rounded-md animate-pulse" />
                ))}
            </div>
        );
    }
    
    if (!departmentStats?.length) {
        return (
            <div className="text-center py-8 space-y-3">
                <div className="text-muted-foreground">
                    No department data available
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">On Leave</TableHead>
                            <TableHead className="text-right">Upcoming</TableHead>
                            <TableHead className="w-[200px]">Coverage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departmentStats.map((dept) => (
                            <TableRow key={dept.departmentId}>
                                <TableCell className="font-medium">
                                    {dept.department}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge
                                        variant={
                                            dept.onLeave > (dept.totalEmployees * 0.2)
                                                ? "destructive"
                                                : dept.onLeave > 0
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                    >
                                        {dept.onLeave}/{dept.totalEmployees}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {dept.upcoming > 0 ? (
                                        <Badge variant="secondary">
                                            {dept.upcoming}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            --
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress
                                            value={dept.coverage}
                                            className={`h-2 ${
                                                dept.coverage < 70
                                                    ? 'bg-destructive/20'
                                                    : dept.coverage < 85
                                                        ? 'bg-yellow-200'
                                                        : 'bg-emerald-200'
                                            }`}
                                        />
                                        <span className={`text-sm ${
                                            dept.coverage < 70
                                                ? 'text-destructive'
                                                : 'text-muted-foreground'
                                        }`}>
                                            {dept.coverage}%
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

