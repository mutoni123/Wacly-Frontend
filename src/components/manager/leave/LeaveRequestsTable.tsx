// components/manager/leave/LeaveRequestTable.tsx
"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: number;
  user_id: string;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  number_of_days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  comments?: string;
  action_by?: string;
  action_at?: string;
  created_at: string;
  updated_at: string;
  user: {
    first_name: string;
    last_name: string;
    department_id: number;
    department?: {
      id: number;
      name: string;
    };
  };
  leaveType: {
    id: number;
    name: string;
    days_allowed: number;
  };
}

interface LeaveRequestTableProps {
  searchTerm: string;
  statusFilter: string;
}

export default function LeaveRequestTable({ searchTerm, statusFilter }: LeaveRequestTableProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API instance
  const createApi = useCallback(() => {
    return axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }, []);

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const api = createApi();
      const response = await api.get('/leave-requests/team');
      if (response.data.success) {
        const validatedRequests = response.data.data.filter((request: LeaveRequest) => 
          request && request.user && request.user.first_name && 
          request.user.last_name && request.leaveType
        );
        setLeaveRequests(validatedRequests);
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave requests';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, createApi]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user, fetchLeaveRequests]);

  // Handle approve/reject actions
  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      const api = createApi();
      const response = await api.put(`/leave-requests/${id}/status`, {
        status: action === 'approve' ? 'Approved' : 'Rejected',
        comments: action === 'approve' ? 'Request approved' : 'Request rejected',
        action_by: user?.id
      });

      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to ${action} request`);
      }

      toast({
        title: "Success",
        description: `Request ${action}ed successfully`,
        variant: "default",
        className: action === 'approve' ? "bg-green-500 text-white" : "bg-amber-500 text-white",
      });

      fetchLeaveRequests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} request`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Permissions check
  const canManageRequest = (request: LeaveRequest) => {
    if (!user) return false;
    return user.role === 'manager' && request.user?.department_id === user.department_id;
  };

  // Filter leave requests
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    if (!request.user || !request.leaveType) return false;
    const fullName = `${request.user.first_name} ${request.user.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(searchLower);
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Employee</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Duration</th>
            <th className="px-4 py-3 text-left font-medium">Department</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center">
                <div className="flex justify-center items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading requests...
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                {error}
              </td>
            </tr>
          ) : filteredLeaveRequests.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No leave requests found
              </td>
            </tr>
          ) : (
            filteredLeaveRequests.map((request) => (
              <tr key={request.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  {`${request.user.first_name} ${request.user.last_name}`}
                </td>
                <td className="px-4 py-3">
                  {request.leaveType.name}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div>{new Date(request.start_date).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">
                      to {new Date(request.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({request.number_of_days} days)
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {request.user.department?.name || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    request.status === "Pending" && "bg-yellow-100 text-yellow-800",
                    request.status === "Approved" && "bg-green-100 text-green-800",
                    request.status === "Rejected" && "bg-red-100 text-red-800"
                  )}>
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {request.status === 'Pending' && canManageRequest(request) && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleAction(request.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleAction(request.id, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}