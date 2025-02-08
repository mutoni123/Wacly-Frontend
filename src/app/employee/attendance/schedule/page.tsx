"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ScheduleEntry {
  id: string;
  date: Date;
  type: 'Regular' | 'Remote' | 'Day Off';
  startTime: string;
  endTime: string;
  project?: string;
}

const AttendanceSchedule: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);  // State for hovered day
  const [scheduleEntries] = useState<ScheduleEntry[]>([
    {
      id: '1',
      date: new Date(2024, 1, 15),
      type: 'Regular',
      startTime: '09:00',
      endTime: '17:30',
      project: 'HR System Development',
    },
    {
      id: '2',
      date: new Date(2024, 1, 20),
      type: 'Remote',
      startTime: '09:00',
      endTime: '17:30',
      project: 'Frontend Redesign',
    },
    {
      id: '3',
      date: new Date(2024, 1, 25),
      type: 'Day Off',
      startTime: '-',
      endTime: '-',
    },
  ]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateCalendarDays = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    const startingDay = firstDay.getDay();

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const calendarDays = generateCalendarDays(currentMonth);

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const getScheduleForDay = (day: Date): ScheduleEntry | undefined => {
    return scheduleEntries.find(entry =>
      entry.date.toDateString() === day.toDateString()
    );
  };

  const renderScheduleType = (type: 'Regular' | 'Remote' | 'Day Off') => {
    switch (type) {
      case 'Regular':
        return 'bg-green-100 text-green-800';
      case 'Remote':
        return 'bg-blue-100 text-blue-800';
      case 'Day Off':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  const DesktopView = () => (
    <div className="hidden md:block">
      <div className="grid grid-cols-7 gap-2 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600">{day}</div>
        ))}
        {calendarDays.map((day, index) => {
          const scheduleEntry = day ? getScheduleForDay(day) : null;
          return (
            <div
              key={index}
              className={`border rounded-lg p-2 min-h-[120px] 
                ${!day ? 'bg-gray-100' : 'hover:bg-blue-50 cursor-pointer'}`}
              onMouseEnter={() => scheduleEntry && setHoveredDay(day)}  // Handle mouse enter
              onMouseLeave={() => setHoveredDay(null)}  // Handle mouse leave
            >
              {day && (
                <>
                  <div className="text-sm font-semibold mb-1">{day.getDate()}</div>
                  {scheduleEntry && (
                    <div
                      className={`rounded p-1 text-xs ${renderScheduleType(scheduleEntry.type)}`}
                    >
                      {scheduleEntry.type}
                      {scheduleEntry.project && `: ${scheduleEntry.project}`}
                    </div>
                  )}
                </>
              )}
              {/* Tooltip for hovered day */}
              {hoveredDay && hoveredDay.toDateString() === day?.toDateString() && scheduleEntry && (
                <div className="absolute left-1/2 -translate-x-1/2 top-12 z-10 bg-white shadow-lg p-2 rounded-md border w-48">
                  <p className="text-xs font-bold">{scheduleEntry.type}</p>
                  <p className="text-xs">Time: {scheduleEntry.startTime} - {scheduleEntry.endTime}</p>
                  {scheduleEntry.project && <p className="text-xs text-gray-600">Project: {scheduleEntry.project}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Card className="w-full">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Upcoming Schedule</h2>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Time</th>
                <th className="py-2 px-4 text-left">Project</th>
              </tr>
            </thead>
            <tbody>
              {scheduleEntries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{entry.date.toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${renderScheduleType(entry.type)}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-2 px-4">{entry.startTime} - {entry.endTime}</td>
                  <td className="py-2 px-4">{entry.project || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const MobileView = () => (
    <div className="block md:hidden space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
          Prev
        </Button>
        <span className="font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
          Next
        </Button>
      </div>

      {scheduleEntries.map((entry) => (
        <Card key={entry.id} className="w-full">
          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">
                {entry.date.toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${renderScheduleType(entry.type)}`}>
                {entry.type}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Time: {entry.startTime} - {entry.endTime}
            </div>
            {entry.project && (
              <div className="text-sm text-gray-600 mt-1">
                Project: {entry.project}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 hidden md:flex">
        <h1 className="text-3xl font-bold text-gray-800">Work Schedule</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => changeMonth(-1)}>
            Previous
          </Button>
          <span className="text-xl font-medium">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" onClick={() => changeMonth(1)}>
            Next
          </Button>
        </div>
      </div>

      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
};

export default AttendanceSchedule;
