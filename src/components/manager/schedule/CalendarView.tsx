// components/manager/schedule/CalendarView.tsx
"use client"
import { useState } from 'react';
import {
    addDays,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isToday,
    startOfMonth,
} from 'date-fns';

interface CalendarViewProps {
    currentDate: Date;
    events?: Array<{
        id: string;
        title: string;
        date: Date;
        shift: string;
        employees: Array<{
            id: string;
            name: string;
        }>;
    }>;
    onDateSelect: (date: Date) => void;
}

export function CalendarView({ currentDate, events = [], onDateSelect }: CalendarViewProps) {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const startingDayIndex = getDay(startDate);

    // Create array for empty days at start of month
    const emptyDays = Array.from({ length: startingDayIndex });

    // Day cell renderer
    const renderDay = (day: Date | null, index: number) => {
        if (!day) {
            return (
                <div
                    key={`empty-${index}`}
                    className="h-32 border border-border bg-muted/30"
                />
            );
        }

        const dayEvents = events.filter(
            event => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );

        return (
            <div
                key={format(day, 'yyyy-MM-dd')}
                className={`h-32 border border-border p-2 cursor-pointer hover:bg-muted/50 transition-colors
                    ${isToday(day) ? 'bg-muted/20' : 'bg-background'}
                `}
                onClick={() => onDateSelect(day)}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${
                        isToday(day) ? 'text-primary' : ''
                    }`}>
                        {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {dayEvents.length} shifts
                        </span>
                    )}
                </div>
                <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                        <div
                            key={event.id}
                            className="text-xs bg-primary/5 text-primary p-1 rounded truncate"
                        >
                            {event.shift} ({event.employees.length})
                        </div>
                    ))}
                    {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                        key={day}
                        className="text-sm font-medium text-muted-foreground text-center py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px">
                {emptyDays.map((_, index) => renderDay(null, index))}
                {daysInMonth.map((day) => renderDay(day, getDay(day)))}
            </div>
        </div>
    );
}