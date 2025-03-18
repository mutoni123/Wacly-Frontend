// components/manager/leave/ApplyLeave.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
  carry_forward: boolean;
  description: string | null;
  requires_approval: boolean;
  status: 'Active' | 'Inactive';
}

interface LeaveStats {
  leave_type_id: number;
  daysUsed: number;
}

interface FormData {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApplyLeaveProps {
  onComplete?: () => void;
}

export default function ApplyLeave({ onComplete }: ApplyLeaveProps) {
  // Hooks and State
  const { toast } = useToast();
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();

  // Fetch Leave Data
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "No authentication token found. Please login again."
          });
          return;
        }

        setIsLoadingTypes(true);
        setError(null);

        const [typesResponse, statsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/leave-types', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('http://localhost:5000/api/leave-requests/stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (!typesResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch leave data');
        }

        const typesData = await typesResponse.json() as ApiResponse<LeaveType[]>;
        const statsData = await statsResponse.json() as ApiResponse<LeaveStats[]>;

        if (!typesData.success || !statsData.success) {
          throw new Error(typesData.message || statsData.message || 'Failed to fetch data');
        }

        const activeTypes = typesData.data.filter(type => type.status === 'Active');
        setLeaveTypes(activeTypes);

        const initialBalances = activeTypes.reduce<{ [key: number]: number }>((acc, type) => {
          const stat = statsData.data.find(s => s.leave_type_id === type.id);
          acc[type.id] = type.days_allowed - (stat?.daysUsed || 0);
          return acc;
        }, {});

        setLeaveBalances(initialBalances);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load leave data';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      } finally {
        setIsLoadingTypes(false);
      }
    };

    if (user?.id) {
      fetchLeaveData();
    }
  }, [user?.id, toast]);
    // Helper Functions
    const calculateDays = () => {
        const start = parseISO(watch('start_date'));
        const end = parseISO(watch('end_date'));
        return differenceInDays(end, start) + 1;
      };
    
      const validateDates = () => {
        const start = parseISO(watch('start_date'));
        const end = parseISO(watch('end_date'));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        if (start < today) {
          throw new Error('Start date cannot be in the past');
        }
        if (end < start) {
          throw new Error('End date cannot be before start date');
        }
        if (selectedLeaveType) {
          const days = calculateDays();
          const balance = leaveBalances[selectedLeaveType.id] || 0;
          if (days > balance) {
            throw new Error(`Insufficient leave balance. You have ${balance} days available.`);
          }
        }
        return true;
      };
    
      // Form Submission
      const onSubmit = async (data: FormData) => {
        try {
          setIsSubmitting(true);
          const token = localStorage.getItem('token');
    
          if (!token || !user?.id) {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Session expired. Please login again."
            });
            return;
          }
    
          // Validate dates
          validateDates();
    
          // Calculate number of days
          const numberOfDays = calculateDays();
    
          // Prepare payload
          const payload = {
            userId: user.id,
            leaveTypeId: Number(data.leave_type_id),
            startDate: data.start_date,
            endDate: data.end_date,
            numberOfDays,
            reason: data.reason.trim()
          };
    
          const response = await fetch('http://localhost:5000/api/leave-requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
    
          const responseData = await response.json();
    
          if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || 'Failed to submit leave request');
          }
    
          toast({
            variant: "default",
            className: "bg-green-500 text-white",
            title: "Success!",
            description: "Leave request submitted successfully"
          });
    
          // Reset form
          setValue('leave_type_id', '');
          setValue('start_date', '');
          setValue('end_date', '');
          setValue('reason', '');
          setSelectedLeaveType(null);
    
          // Call onComplete callback
          onComplete?.();
    
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : 'Failed to submit request'
          });
        } finally {
          setIsSubmitting(false);
        }
      };
    
      // Render Functions
      const renderLeaveTypeOptions = () => {
        if (isLoadingTypes) {
          return (
            <SelectItem value="loading" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
              Loading leave types...
            </SelectItem>
          );
        }
    
        if (error) {
          return (
            <SelectItem value="error" disabled>
              Error loading leave types
            </SelectItem>
          );
        }
    
        if (leaveTypes.length === 0) {
          return (
            <SelectItem value="none" disabled>
              No leave types available
            </SelectItem>
          );
        }
    
        return leaveTypes.map(type => (
          <SelectItem 
            key={type.id} 
            value={type.id.toString()} 
            disabled={leaveBalances[type.id] === 0}
            className="py-3"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-medium">{type.name}</span>
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">
                  {leaveBalances[type.id] || 0}d available
                </span>
                {type.requires_approval && (
                  <span className="text-xs text-muted-foreground">
                    Requires approval
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ));
      };
    
      return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Leave Type Selection */}
          <div className="space-y-2">
            <Label className="text-base">Leave Type</Label>
            <Select
              value={watch('leave_type_id')}
              onValueChange={value => {
                const type = leaveTypes.find(t => t.id === Number(value));
                setSelectedLeaveType(type || null);
                setValue('leave_type_id', value);
              }}
              disabled={isLoadingTypes}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder={
                  isLoadingTypes ? "Loading..." : error ? "Error loading types" : "Select leave type"
                } />
              </SelectTrigger>
              <SelectContent>
                {renderLeaveTypeOptions()}
              </SelectContent>
            </Select>
            {selectedLeaveType?.description && (
              <p className="text-sm text-muted-foreground italic">
                {selectedLeaveType.description}
              </p>
            )}
          </div>
    
          {/* Date Selection */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-base">Start Date</Label>
              <Input
                type="date"
                className="h-12"
                {...register('start_date', {
                  required: 'Start date is required',
                  validate: {
                    notPast: value => {
                      const date = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date >= today || 'Start date cannot be in the past';
                    }
                  }
                })}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-base">End Date</Label>
              <Input
                type="date"
                className="h-12"
                {...register('end_date', {
                  required: 'End date is required',
                  validate: {
                    afterStart: value => {
                      const start = new Date(watch('start_date'));
                      const end = new Date(value);
                      return end >= start || 'End date must be after start date';
                    }
                  }
                })}
                min={watch('start_date')}
                disabled={!watch('start_date')}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
    
          {/* Date Summary */}
          {watch('start_date') && watch('end_date') && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <div className="grid grid-cols-3 divide-x divide-border/50">
                <div className="px-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="font-medium">
                    {format(parseISO(watch('start_date')), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="px-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">End Date</p>
                  <p className="font-medium">
                    {format(parseISO(watch('end_date')), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="px-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium text-primary">{calculateDays()} days</p>
                </div>
              </div>
            </div>
          )}
    
          {/* Reason Input */}
          <div className="space-y-2">
            <Label className="text-base">Reason</Label>
            <Textarea
              {...register('reason', {
                required: 'Please provide a reason',
                minLength: { value: 20, message: 'Please provide at least 20 characters' },
                maxLength: { value: 500, message: 'Maximum 500 characters allowed' }
              })}
              className="min-h-[120px] resize-none"
              placeholder="Please explain your leave request in detail..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.reason ? (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Minimum 20 characters required
                </p>
              )}
              <span className="text-sm text-muted-foreground">
                {watch('reason')?.length || 0}/500
              </span>
            </div>
          </div>
    
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full md:w-auto min-w-[200px]"
            disabled={isSubmitting || !watch('leave_type_id')}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      );
    }