"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

interface TimeEntry {
    id: number;
    user_id: string;
    clock_in: string;
    clock_out: string | null;
    duration: number | null;
    status: 'In Progress' | 'Completed';
    created_at: string;
}

const AttendanceLog: React.FC = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isClockInActive, setIsClockInActive] = useState(true);

    // Format duration from minutes to hours and minutes
    const formatDuration = (minutes: number | null): string => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Fetch attendance logs
    const fetchAttendanceLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE}/api/attendance/today`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }

            setTimeEntries(data.data);
            const activeEntry = data.data.find((entry: TimeEntry) => entry.status === 'In Progress');
            setIsClockInActive(!activeEntry);
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load attendance logs"
            });
        }
    };

    useEffect(() => {
        fetchAttendanceLogs();
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockIn = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE}/api/attendance/clock-in`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }

            await fetchAttendanceLogs();
            toast({
                title: "Success",
                description: "Clock in successful",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            console.error('Clock in error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to clock in"
            });
        }
    };

    const handleClockOut = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE}/api/attendance/clock-out`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }

            await fetchAttendanceLogs();
            toast({
                title: "Success",
                description: "Clock out successful",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            console.error('Clock out error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to clock out"
            });
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
                                ${isClockInActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}
                            `}
                        >
                            Clock In
                        </Button>
                        <Button
                            onClick={handleClockOut}
                            disabled={isClockInActive}
                            className={`
                                w-40 h-16 text-lg 
                                ${!isClockInActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'}
                            `}
                        >
                            Clock Out
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-center">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-700">
                                {timeEntries[0]?.status === 'In Progress' ? 'Shift In Progress' : 'No Active Shift'}
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
                                                {new Date(entry.created_at).toLocaleDateString()}
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