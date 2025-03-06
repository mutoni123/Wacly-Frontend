// components/LeaveCalendar.tsx
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/contsants";

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

export function LeaveCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [month, setMonth] = useState<Date>(new Date());
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const { toast } = useToast();

    // Fetch leave data with debugging
    const fetchLeaveData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            console.log('Fetching leave requests...'); // Debug log
            const response = await fetch(`${API_BASE}/leave-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status); // Debug log
            
            if (!response.ok) {
                throw new Error(`Failed to fetch leave requests: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data); // Debug log

            if (data.success && Array.isArray(data.data)) {
                setLeaveRequests(data.data);
                console.log('Processed leave requests:', data.data); // Debug log
            } else {
                throw new Error('Invalid data received from server');
            }
        } catch (error) {
            console.error('Error fetching leave data:', error); // Debug log
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch leave data",
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchLeaveData();
    }, [month, fetchLeaveData]);

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

    const renderDay = (day: Date) => {
        const leaves = getLeavesForDate(day);
        const hasLeaves = leaves.length > 0;

        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className={`h-9 w-9 p-0 relative flex items-center justify-center transition-colors
                            ${hasLeaves ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`}>
                            <span className={`text-sm ${hasLeaves ? 'font-medium text-green-700' : ''}`}>
                                {day.getDate()}
                            </span>
                            {hasLeaves && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                    <div className="h-1 w-1 rounded-full bg-green-500" />
                                </div>
                            )}
                        </div>
                    </TooltipTrigger>
                    {hasLeaves && (
                        <TooltipContent 
                            className="bg-green-50 border-green-200 p-3 shadow-sm"
                            sideOffset={5}
                        >
                            <div className="space-y-2">
                                {leaves.map(leave => (
                                    <div 
                                        key={leave.id} 
                                        className="text-sm flex items-center justify-between gap-3 text-green-900"
                                    >
                                        <span className="font-medium">
                                            {leave.user 
                                                ? `${leave.user.first_name} ${leave.user.last_name}`
                                                : leave.user_id}
                                        </span>
                                        <Badge 
                                            variant="outline" 
                                            className="bg-white border-green-200 text-green-700"
                                        >
                                            {leave.leaveType?.name || 'Leave'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    };

    const selectedDateLeaves = selectedDate ? getLeavesForDate(selectedDate) : [];

    return (
        <div className="space-y-4">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        const prevMonth = new Date(month);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);
                        setMonth(prevMonth);
                    }}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-medium">
                    {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        const nextMonth = new Date(month);
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        setMonth(nextMonth);
                    }}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Calendar */}
            <div className="border rounded-md p-4">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={month}
                    onMonthChange={setMonth}
                    components={{
                        Day: ({ date }) => renderDay(date)
                    }}
                />
            </div>

            {/* Selected Date Details */}
            {selectedDate && selectedDateLeaves.length > 0 && (
                <Card className="p-4">
                    <h4 className="font-medium mb-3">
                        Leaves on {selectedDate.toLocaleDateString()}
                    </h4>
                    <div className="space-y-2">
                        {selectedDateLeaves.map((leave) => (
                            <div 
                                key={leave.id} 
                                className="flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200"
                            >
                                <div>
                                    <p className="font-medium text-green-900">
                                        {leave.user 
                                            ? `${leave.user.first_name} ${leave.user.last_name}`
                                            : leave.user_id}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant="outline" className="bg-white border-green-200 text-green-700">
                                    {leave.leaveType?.name || 'Leave'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}