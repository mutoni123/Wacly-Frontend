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
import { UserCheck, Clock, Loader2 } from 'lucide-react';
import { useAttendance } from '@/hooks/attendance-hook';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
] as const;

export default function AdminAttendancePage() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: attendanceData,
    stats,
    departments,
    pagination,
    loading,
    fetchAttendance,
    handleExport,
  } = useAttendance();

  useEffect(() => {
    fetchAttendance({
      dateRange,
      departmentId: selectedDepartment === "all" ? undefined : selectedDepartment,
      status: selectedStatus === "all" ? undefined : selectedStatus,
    });
  }, [dateRange, selectedDepartment, selectedStatus, fetchAttendance]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
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
      <h1 className="text-3xl font-bold">Attendance Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDays || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalHours || 0}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageHoursPerDay || 0}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DateRangePicker
              dateRange={dateRange}
              onChange={handleDateRangeChange}
              className="w-full"
            />

            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                departmentId: selectedDepartment,
                status: selectedStatus,
              })}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf', {
                dateRange,
                departmentId: selectedDepartment,
                status: selectedStatus,
              })}
            >
              Export PDF
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
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {`${record.user.first_name} ${record.user.last_name}`}
                      </TableCell>
                      <TableCell>
                        {departments.find(d => d.id === record.user.department_id)?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.created_at), 'PP')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.clock_in), 'pp')}
                      </TableCell>
                      <TableCell>
                        {record.clock_out
                          ? format(new Date(record.clock_out), 'pp')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{formatDuration(record.duration)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAttendance({
                      page: pagination.page - 1,
                      dateRange,
                      departmentId: selectedDepartment === "all" ? undefined : selectedDepartment,
                      status: selectedStatus === "all" ? undefined : selectedStatus,
                    })}
                    disabled={pagination.page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAttendance({
                      page: pagination.page + 1,
                      dateRange,
                      departmentId: selectedDepartment === "all" ? undefined : selectedDepartment,
                      status: selectedStatus === "all" ? undefined : selectedStatus,
                    })}
                    disabled={pagination.page === pagination.totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}