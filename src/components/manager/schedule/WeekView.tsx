// components/manager/schedule/WeekView.tsx
"use client"
import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/schedule';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

export function WeekView({ currentDate, events, onDateSelect }: WeekViewProps) {
  // Get start of the week (Sunday)
  const startDate = startOfWeek(currentDate);

  // Generate week days
  const weekDays = Array.from({ length: 7 }).map((_, index) => 
    addDays(startDate, index)
  );

  // Group events by date and hour
  const getEventsForTimeSlot = (date: Date, hour: string) => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date) && 
      format(new Date(event.date), 'HH') === hour
    );
  };

  // Time slots from 00:00 to 23:00
  const timeSlots = Array.from({ length: 24 }).map((_, index) => {
    const hour = index.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="overflow-auto">
      {/* Week Header */}
      <div className="grid grid-cols-8 gap-px bg-muted">
        {/* Time column header */}
        <div className="h-14 bg-background p-2 sticky left-0 z-10">
          <div className="font-medium text-muted-foreground text-sm text-center">
            Time
          </div>
        </div>

        {/* Days of week */}
        {weekDays.map((date) => (
          <div key={date.toString()} className="h-14 bg-background p-2">
            <div className="font-medium text-sm text-center">
              {format(date, 'EEE')}
            </div>
            <div className={cn(
              "text-center text-sm",
              isSameDay(date, new Date()) && "text-primary font-bold"
            )}>
              {format(date, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-8 gap-px bg-muted">
        {/* Time slots */}
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            {/* Time label */}
            <div className="h-20 bg-background p-2 sticky left-0 z-10">
              <div className="text-muted-foreground text-sm">
                {time}
              </div>
            </div>

            {/* Day columns */}
            {weekDays.map((date) => {
              const hour = time.split(':')[0];
              const slotEvents = getEventsForTimeSlot(date, hour);

              return (
                <div
                  key={`${date.toString()}-${time}`}
                  className={cn(
                    "h-20 bg-background border-b relative",
                    "hover:bg-muted/50 cursor-pointer"
                  )}
                  onClick={() => onDateSelect(date)}
                >
                  {slotEvents.map((event) => (
                    <TooltipProvider key={event.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute inset-x-0 m-1 p-1 rounded-md bg-primary/10 border border-primary/20">
                            <div className="text-xs font-medium truncate">
                              {event.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {event.employees.length} employees
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.date), 'h:mm a')}
                            </p>
                            <div className="text-sm">
                              {event.employees.map(emp => emp.name).join(', ')}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}