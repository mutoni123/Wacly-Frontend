"use client";

import { useState, useEffect } from 'react';
import { format, startOfToday, endOfToday } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Users, Loader2 } from 'lucide-react';
import { useAttendance } from '@/hooks/attendance-hook';



interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_id: string;
}

interface AttendanceRecord {
    id: string;
    user: User;
    clock_in: string;
    clock_out: string | null;
    duration: number | null;
    status: 'In Progress' | 'Completed';
}

interface LiveClockProps {
    recordCount: number;
}

function LiveClock({ recordCount }: LiveClockProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Current Time</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {format(time, 'hh:mm:ss a')}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Today&apos;s Date</CardTitle>
                    <Calendar className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {format(time, 'PPP')}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                    <Users className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {recordCount}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AttendanceTable() {
    const { data: records, loading, departments, fetchAttendance } = useAttendance();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchAttendance({
                    dateRange: {
                        from: startOfToday(),
                        to: endOfToday()
                    }
                });
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch attendance');
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchAttendance]);

    const getStatusBadgeColor = (status: 'In Progress' | 'Completed'): string => {
        const colors = {
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Completed': 'bg-green-100 text-green-800',
        };
        return colors[status];
    };

    const formatDuration = (minutes: number | null): string => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getDepartmentName = (departmentId: string): string => {
        if (!Array.isArray(departments)) {
            return 'Loading...';
        }
        return departments.find(dept => dept.id === departmentId)?.name || '-';
    };

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Today&apos;s Attendance</h1>
            <LiveClock recordCount={records?.length || 0} />
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-px bg-gray-200/75" />
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-gray-50">Employee</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Clock In</TableHead>
                                            <TableHead>Clock Out</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!records || records.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                                    No attendance records found for today
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            records.map((record: AttendanceRecord) => (
                                                <TableRow key={record.id} className="hover:bg-gray-50">
                                                    <TableCell className="sticky left-0 bg-white">
                                                        <div className="flex items-center">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>
                                                                    {record.user.first_name[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {`${record.user.first_name} ${record.user.last_name}`}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {record.user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {getDepartmentName(record.user.department_id)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {format(new Date(record.clock_in), 'pp')}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {record.clock_out ? format(new Date(record.clock_out), 'pp') : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {formatDuration(record.duration)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                                                            {record.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}