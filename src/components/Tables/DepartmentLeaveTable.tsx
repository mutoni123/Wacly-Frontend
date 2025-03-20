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
  employee_count: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  role: "admin" | "manager" | "employee";
}

interface LeaveRequest {
  id: number;
  user_id: string;
  start_date: string;
  end_date: string;
  status: "Pending" | "Approved" | "Rejected";
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
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
  
      // Fetch departments (public route)
      const departmentsRes = await fetch(`${API_BASE}/departments`, { headers });
      const departmentsData = await departmentsRes.json();
  
      if (!departmentsData.success) {
        throw new Error('Failed to fetch departments');
      }
  
      const departments: Department[] = departmentsData.data;
  
      // Fetch users (protected route, admin-only)
      let users: User[] = [];
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'admin') {
        const usersRes = await fetch(`${API_BASE}/users`, { headers });
        const usersData = await usersRes.json();
  
        if (!usersData.success) {
          throw new Error('Failed to fetch users');
        }
  
        users = usersData.data;
      }
  
      // Fetch leave requests (protected route, admin-only)
      let leaves: LeaveRequest[] = [];
      if (user?.role === 'admin') {
        const leavesRes = await fetch(`${API_BASE}/leave-requests`, { headers });
        const leavesData = await leavesRes.json();
  
        if (!leavesData.success) {
          throw new Error('Failed to fetch leave requests');
        }
  
        leaves = leavesData.data;
      }
  
      // Filter employees (users with role 'employee')
      const employees = users.filter((user: User) => user.role.toLowerCase() === 'employee');
  
      // Filter approved leaves
      const approvedLeaves = leaves.filter((leave: LeaveRequest) => leave.status === 'Approved');
  
      // Calculate department statistics
      const stats = departments.map((dept: Department) => {
        const departmentUsers = employees.filter((emp: User) => emp.department_id === dept.id);
        const totalEmployees = departmentUsers.length;
  
        // Calculate current leaves
        const now = new Date();
        now.setHours(0, 0, 0, 0);
  
        const onLeave = approvedLeaves.filter((leave: LeaveRequest) => {
          const startDate = new Date(leave.start_date);
          const endDate = new Date(leave.end_date);
          return (
            startDate <= now &&
            endDate >= now &&
            departmentUsers.some((user: User) => user.id === leave.user_id)
          );
        }).length;
  
        // Calculate upcoming leaves
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
  
        const upcoming = approvedLeaves.filter((leave: LeaveRequest) => {
          const startDate = new Date(leave.start_date);
          return (
            startDate > now &&
            startDate <= nextWeek &&
            departmentUsers.some((user: User) => user.id === leave.user_id)
          );
        }).length;
  
        // Calculate coverage
        const coverage =
          totalEmployees > 0 ? Math.round(((totalEmployees - onLeave) / totalEmployees) * 100) : 100;
  
        return {
          department: dept.name.trim(),
          departmentId: dept.id,
          totalEmployees,
          onLeave,
          upcoming,
          coverage,
        };
      });
  
      setDepartmentStats(stats);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
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
        <div className="text-muted-foreground">No department data available</div>
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
                <TableCell className="font-medium">{dept.department}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      dept.onLeave > dept.totalEmployees * 0.2
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
                    <Badge variant="secondary">{dept.upcoming}</Badge>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={dept.coverage}
                      className={`h-2 ${
                        dept.coverage < 70
                          ? "bg-destructive/20"
                          : dept.coverage < 85
                          ? "bg-yellow-200"
                          : "bg-emerald-200"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        dept.coverage < 70 ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
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