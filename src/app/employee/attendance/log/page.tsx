"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { attendanceService } from '@/services/attendanceService';
import type { AttendanceRecord } from '@/services/attendanceService';

const AttendanceLog: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<AttendanceRecord[]>([]);
  const [isClockInActive, setIsClockInActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Check active session and fetch attendance logs
  const fetchAttendanceData = async () => {
    try {
      // First check active session
      const activeSessionResponse = await attendanceService.getActiveSession();
      const hasActiveSession = !!activeSessionResponse.data;
      setIsClockInActive(!hasActiveSession);

      // Then fetch today's attendance
      const todayResponse = await attendanceService.getAllAttendance({
        startDate: new Date(),
        endDate: new Date()
      });

      if (todayResponse.success) {
        setTimeEntries(todayResponse.data.attendance);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance data"
      });

      if (error instanceof Error && error.message.includes('401')) {
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceService.clockIn();
      if (response.success) {
        toast({
          title: "Success",
          description: "Clock in successful",
          className: "bg-green-500 text-white",
        });
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Clock in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clock in"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceService.clockOut();
      if (response.success) {
        toast({
          title: "Success",
          description: "Clock out successful",
          className: "bg-green-500 text-white",
        });
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Clock out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clock out"
      });
    } finally {
      setIsLoading(false);
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
              disabled={!isClockInActive || isLoading}
              className={`
                w-40 h-16 text-lg
                ${isClockInActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              {isLoading ? 'Processing...' : 'Clock In'}
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={isClockInActive || isLoading}
              className={`
                w-40 h-16 text-lg
                ${!isClockInActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              {isLoading ? 'Processing...' : 'Clock Out'}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                {!isClockInActive ? 'Shift In Progress' : 'No Active Shift'}
              </p>
              {timeEntries[0]?.clock_in && (
                <p className="text-sm text-gray-500 mt-2">
                  Clock In: {new Date(timeEntries[0].clock_in).toLocaleTimeString()}
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
                      <td className="py-3 px-4">
                        {new Date(entry.session_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(entry.clock_in).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        {entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : '-'}
                      </td>
                      <td className="py-3 px-4">{formatDuration(entry.duration)}</td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${entry.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
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