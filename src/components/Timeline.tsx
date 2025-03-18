"use client"
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE } from '@/lib/contsants';
import { format } from 'date-fns';

interface LeaveRequest {
  id: number;
  user_id: string;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  status: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  leaveType?: {
    name: string;
  };
}

interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
  type: 'leave';
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await fetch(`${API_BASE}/leave-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch timeline data');
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          const leaves = data.data
            .filter((leave: LeaveRequest) => 
              ['approved', 'pending'].includes(leave.status.toLowerCase())
            )
            .map((leave: LeaveRequest) => ({
              date: new Date(leave.start_date),
              title: `${leave.user?.first_name} ${leave.user?.last_name} - ${leave.leaveType?.name}`,
              description: `${leave.status} leave request`,
              type: 'leave' as const
            }));

          const sortedEvents = leaves.sort((a: TimelineEvent, b: TimelineEvent) => 
            a.date.getTime() - b.date.getTime()
          );
          setEvents(sortedEvents);
        }

      } catch (error) {
        console.error('Error fetching timeline data:', error);
        toast({
          title: "Error",
          description: "Failed to load timeline data",
          variant: "destructive",
        });
      }
    };

    fetchTimelineData();
  }, [toast]);

  const getEventStyles = (type: string) => {
    switch (type) {
      case 'leave':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No upcoming events
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="min-w-[80px] text-sm text-gray-500">
            {format(event.date, 'MMM dd')}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${getEventStyles(event.type)}`}>
              {event.title}
            </p>
            <p className="text-sm text-gray-500">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}