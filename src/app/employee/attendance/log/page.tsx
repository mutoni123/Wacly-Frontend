"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimeEntry {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  duration?: string;
  status: 'Completed' | 'In Progress';
}

const AttendanceLog: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isClockInActive, setIsClockInActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    const newEntry: TimeEntry = {
      id: new Date().toISOString(),
      date: currentTime.toLocaleDateString(),
      clockIn: currentTime.toLocaleTimeString(),
      status: 'In Progress'
    };
    
    setTimeEntries(prev => [newEntry, ...prev]);
    setIsClockInActive(false);
  };

  const handleClockOut = () => {
    const latestEntry = timeEntries[0];
    if (latestEntry && latestEntry.status === 'In Progress') {
      const clockInTime = new Date(`${latestEntry.date} ${latestEntry.clockIn}`);
      const clockOutTime = currentTime;
      const durationMs = clockOutTime.getTime() - clockInTime.getTime();
      
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      const updatedEntries = [...timeEntries];
      updatedEntries[0] = {
        ...updatedEntries[0],
        clockOut: currentTime.toLocaleTimeString(),
        duration: `${hours}h ${minutes}m`,
        status: 'Completed'
      };

      setTimeEntries(updatedEntries);
      setIsClockInActive(true);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Tracker</h1>
        <div className="text-xl font-medium text-gray-600">
          {currentTime.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Clock In / Out</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center space-x-6 p-6">
            <Button 
              onClick={handleClockIn} 
              disabled={!isClockInActive}
              className={`
                w-40 h-16 text-lg
                ${isClockInActive 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              Clock In
            </Button>
            <Button 
              onClick={handleClockOut} 
              disabled={isClockInActive}
              className={`
                w-40 h-16 text-lg
                ${!isClockInActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              Clock Out
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Todays Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                {timeEntries[0]?.status === 'In Progress' 
                  ? 'Shift In Progress' 
                  : 'No Active Shift'}
              </p>
              {timeEntries[0]?.clockIn && (
                <p className="text-sm text-gray-500 mt-2">
                  Clock In: {timeEntries[0].clockIn}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Clock In</th>
                    <th className="py-3 px-4 text-left">Clock Out</th>
                    <th className="py-3 px-4 text-left">Duration</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{entry.date}</td>
                      <td className="py-3 px-4">{entry.clockIn}</td>
                      <td className="py-3 px-4">{entry.clockOut || '-'}</td>
                      <td className="py-3 px-4">{entry.duration || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${entry.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'}
                        `}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceLog;