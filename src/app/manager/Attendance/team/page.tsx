"use client"
import { useState, useEffect } from 'react';
import { DateRange } from "react-day-picker"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { UserCheck, Loader2, Edit2 } from 'lucide-react';
import { useTeamAttendance } from '@/hooks/team-attendance-hook';
import { format } from 'date-fns';
import { AttendanceEditModal } from '@/components/manager/attendance/AttendanceEditModal';

// Types
interface AttendanceRecord {
    id: string;
    user_id: string;
    clock_in: string | null;
    clock_out: string | null;
    duration: number | null;
    status: 'In Progress' | 'Completed';
    session_date: string;
    is_modified: boolean;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        department_id: string;
    };
}

interface AttendanceUpdateData {
    clock_in?: string;
    clock_out?: string;
    status?: 'In Progress' | 'Completed';
    notes?: string;
}

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
] as const;

export default function TeamAttendancePage() {
    const [dateRange, setDateRange] = useState<DateRange>();
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);

    const {
        data: attendanceData,
        stats,
        loading,
        pagination,
        fetchTeamAttendance,
        updateAttendance,
        handleExport,
    } = useTeamAttendance();

    useEffect(() => {
        console.log('Fetching with params:', {
            dateRange,
            status: selectedStatus === "all" ? undefined : selectedStatus,
        });
        fetchTeamAttendance({
            dateRange,
            status: selectedStatus === "all" ? undefined : selectedStatus,
            limit: 10,
        });
    }, [dateRange, selectedStatus, fetchTeamAttendance]);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
    };

    const handleEditAttendance = (attendance: AttendanceRecord) => {
        setSelectedAttendance(attendance);
        setIsEditModalOpen(true);
    };

    const handleAttendanceUpdate = async (data: AttendanceUpdateData) => {
        try {
            if (!selectedAttendance) return;
            await updateAttendance(selectedAttendance.id, data);
            setIsEditModalOpen(false);
            fetchTeamAttendance({
                dateRange,
                status: selectedStatus === "all" ? undefined : selectedStatus,
            });
        } catch (error) {
            console.error('Error updating attendance:', error);
        }
    };

    const formatDuration = (minutes: number | null): string => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const filteredData = attendanceData.filter(record => {
        if (!searchQuery) return true;
        const fullName = `${record.user.first_name} ${record.user.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="p-6 space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.presentToday || 0}
                        </div>
                    </CardContent>
                </Card>
                {/* Add more stat cards here */}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DateRangePicker
                            dateRange={dateRange}
                            onChange={handleDateRangeChange}
                            className="w-full"
                        />
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Search employee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => handleExport('csv', {
                                dateRange,
                                status: selectedStatus,
                            })}
                        >
                            Export CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Modified</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                {`${record.user.first_name} ${record.user.last_name}`}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(record.session_date), 'PP')}
                                            </TableCell>
                                            <TableCell>
                                                {record.clock_in
                                                    ? format(new Date(record.clock_in), 'pp')
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {record.clock_out
                                                    ? format(new Date(record.clock_out), 'pp')
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {formatDuration(record.duration)}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    record.status === 'Completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {record.is_modified ? 'Yes' : 'No'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditAttendance(record)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between py-4">
                                <div className="text-sm text-gray-500">
                                    Showing {filteredData.length} records
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchTeamAttendance({
                                            page: pagination?.page ? pagination.page - 1 : 1,
                                            dateRange,
                                            status: selectedStatus === "all" ? undefined : selectedStatus,
                                        })}
                                        disabled={!pagination?.hasPreviousPage || loading}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchTeamAttendance({
                                            page: pagination?.page ? pagination.page + 1 : 2,
                                            dateRange,
                                            status: selectedStatus === "all" ? undefined : selectedStatus,
                                        })}
                                        disabled={!pagination?.hasNextPage || loading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <AttendanceEditModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedAttendance(null);
                }}
                attendance={selectedAttendance}
                onSubmit={handleAttendanceUpdate}
            />
        </div>
    );
}