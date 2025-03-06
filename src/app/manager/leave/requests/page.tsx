'use client';

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { differenceInDays, parseISO } from "date-fns";
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

interface LeaveType {
  id: number;
  name: string;
  description?: string;
  days_allowed: number;
  carry_forward: boolean;
  requires_approval: boolean;
  status: 'Active' | 'Inactive';
}

interface FormData {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

export default function ManagerLeaveRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // State management
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'manager') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, router, user]);

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
    // Fetch functions with improved error handling
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
            request && 
            request.user &&
            request.user.first_name &&
            request.user.last_name &&
            request.leaveType
          );
          
          setLeaveRequests(validatedRequests);
          setError(null);
  
          // Debug log
          console.log('Fetched leave requests:', validatedRequests);
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
  
    const fetchLeaveTypes = useCallback(async () => {
      try {
        const api = createApi();
        const response = await api.get('/leave-types');
        
        if (response.data.success) {
          const activeLeaveTypes = response.data.data.filter(
            (type: LeaveType) => type.status === 'Active'
          );
          setLeaveTypes(activeLeaveTypes);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave types';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }, [toast, createApi]);
  
    // Initial data fetch
    useEffect(() => {
      if (user && isAuthenticated) {
        fetchLeaveRequests();
        fetchLeaveTypes();
      }
    }, [user, isAuthenticated, fetchLeaveRequests, fetchLeaveTypes]);
  
    // Form handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };
  
    const handleStatusChange = (value: string) => {
      setStatusFilter(value);
    };
  
    const handleLeaveTypeChange = (value: string) => {
      const selectedType = leaveTypes.find(type => type.id.toString() === value);
      setSelectedLeaveType(selectedType || null);
      setFormData(prev => ({ ...prev, leave_type_id: value }));
    };
  
    const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };
  
    // Validation
    const validateDates = () => {
      if (!formData.start_date || !formData.end_date) {
        throw new Error('Please select both start and end dates');
      }
  
      const start = parseISO(formData.start_date);
      const end = parseISO(formData.end_date);
  
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      if (start < today) {
        throw new Error('Start date cannot be in the past');
      }
  
      if (end < start) {
        throw new Error('End date cannot be before start date');
      }
  
      const days = differenceInDays(end, start) + 1;
  
      if (selectedLeaveType?.days_allowed && days > selectedLeaveType.days_allowed) {
        throw new Error(
          `Maximum ${selectedLeaveType.days_allowed} days allowed for ${selectedLeaveType.name}`
        );
      }
  
      return days;
    };
  
    // Form submission with improved error handling
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
  
      try {
        const api = createApi();
        if (!formData.leave_type_id) {
          throw new Error('Please select a leave type');
        }
  
        const days = validateDates();
        const payload = {
          leave_type_id: parseInt(formData.leave_type_id),
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason.trim(),
          number_of_days: days
        };
  
        const response = await api.post('/leave-requests', payload);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to submit request');
        }
  
        toast({
          title: "Success",
          description: "Leave request submitted successfully",
          variant: "default",
          className: "bg-green-500 text-white",
        });
  
        setIsModalOpen(false);
        setFormData({
          leave_type_id: '',
          start_date: '',
          end_date: '',
          reason: ''
        });
        fetchLeaveRequests();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to submit request";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    };
      // Action handlers with improved error handling
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

  // Improved permissions check
  const canManageRequest = (request: LeaveRequest) => {
    if (!user) return false;
    
    // Check if user is a manager and if the department IDs match
    return user.role === 'manager' && 
           request.user?.department_id === user.department_id;
  };

  // Enhanced filtering with null checks
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    if (!request.user || !request.leaveType) return false;

    const fullName = `${request.user.first_name} ${request.user.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(searchLower);
    const matchesStatus = statusFilter === 'all' || 
                         request.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Team Leave Requests</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Calendar className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
                disabled={loading}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info - Remove in production 
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-slate-100 p-4">
          <p>Requests Count: {leaveRequests.length}</p>
          <p>Filtered Count: {filteredLeaveRequests.length}</p>
          <p>User Department: {user?.department_id}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
        </Card>
      )}*/}
            {/* Table */}
            <Card>
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
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          request.status === "Pending" && "bg-yellow-100 text-yellow-800",
                          request.status === "Approved" && "bg-green-100 text-green-800",
                          request.status === "Rejected" && "bg-red-100 text-red-800"
                        )}
                      >
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
      </Card>

      {/* New Leave Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="leave_type">Leave Type</Label>
                <Select
                  value={formData.leave_type_id}
                  onValueChange={handleLeaveTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id.toString()}
                        disabled={type.status === 'Inactive'}
                      >
                        {type.name}
                        {type.days_allowed && ` (Max ${type.days_allowed} days)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLeaveType?.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedLeaveType.description}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a detailed reason for your leave request"
                  required
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    leave_type_id: '',
                    start_date: '',
                    end_date: '',
                    reason: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}