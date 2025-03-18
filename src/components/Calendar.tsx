"use client"
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { API_BASE } from '@/lib/contsants';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeaveRequest {
  id: number;
  user_id: string;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  number_of_days: number;
  status: string;
  reason: string;
  comments: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  leaveType?: {
    name: string;
  };
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();

  const fetchLeaveData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE}/leave-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leave requests: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Filter out rejected leaves and only keep pending and approved
        const filteredLeaves = data.data.filter((leave: LeaveRequest) => 
            leave.status.toLowerCase() === 'pending' || 
            leave.status.toLowerCase() === 'approved'
        );
        setLeaveRequests(filteredLeaves);
      } else {
        throw new Error('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch leave data",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getLeavesForDate = (date: Date) => {
    return leaveRequests.filter(request => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const getLeaveIndicatorColor = (status: string) => {
    return status.toLowerCase() === 'approved' 
      ? 'bg-green-500' 
      : 'bg-yellow-500';  // Pending
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={`empty-${index}`} className="h-12" />
        ))}

        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = date.toDateString() === new Date().toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dayLeaves = getLeavesForDate(date);

          return (
            <TooltipProvider key={day}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`
                    h-12 p-1 flex flex-col items-center justify-between
                    ${isWeekend ? 'bg-gray-50' : 'bg-white'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    hover:bg-gray-100 rounded-lg transition-colors
                  `}>
                    <span className={`text-sm ${isWeekend ? 'text-gray-500' : ''}`}>
                      {day}
                    </span>
                    {dayLeaves.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {dayLeaves.slice(0, 3).map((leave) => (
                          <div
                            key={leave.id}
                            className={`w-1.5 h-1.5 rounded-full ${getLeaveIndicatorColor(leave.status)}`}
                          />
                        ))}
                        {dayLeaves.length > 3 && (
                          <span className="text-xs text-gray-500">+{dayLeaves.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {dayLeaves.length > 0 && (
                  <TooltipContent>
                    <div className="p-2">
                      <p className="font-semibold mb-1">Leaves ({dayLeaves.length})</p>
                      {dayLeaves.map(leave => (
                        <div key={leave.id} className="text-sm">
                          <span className={`inline-block w-2 h-2 rounded-full ${getLeaveIndicatorColor(leave.status)} mr-2`} />
                          {leave.user 
                            ? `${leave.user.first_name} ${leave.user.last_name}`
                            : leave.user_id} - {leave.leaveType?.name || 'Leave'}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}