// src/hooks/attendance-hook.ts
import { useState, useCallback, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { useToast } from "@/hooks/use-toast";
import { 
    attendanceService, 
    AttendanceRecord, 
    AttendanceStats, 
    Department
} from '@/services/attendanceService';

interface FetchParams {
    page?: number;
    limit?: number;
    dateRange?: DateRange;
    departmentId?: string;
    status?: string;
}

interface Pagination {
    total: number;
    page: number;
    totalPages: number;
}

export function useAttendance() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        totalPages: 1,
    });

    const fetchDepartments = useCallback(async () => {
        try {
            const departmentsData = await attendanceService.getDepartments();
            // Assuming departmentsData is already an array of Department from the service
            setDepartments(departmentsData);
        } catch (err) {
            console.error('Error fetching departments:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to fetch departments",
            });
        }
    }, [toast]);

    const fetchAttendance = useCallback(async ({
        page = 1,
        limit = 10,
        dateRange,
        departmentId,
        status,
    }: FetchParams) => {
        try {
            setLoading(true);

            const params = {
                page,
                limit,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
                department_id: departmentId === 'all' ? undefined : departmentId,
                status: status === 'all' ? undefined : status,
            };

            const [attendanceResponse, statsResponse] = await Promise.all([
                attendanceService.getAllAttendance(params),
                attendanceService.getStatistics({
                    startDate: dateRange?.from,
                    endDate: dateRange?.to,
                    department_id: departmentId === 'all' ? undefined : departmentId,
                })
            ]);

            if (attendanceResponse.success) {
                setData(attendanceResponse.data.attendance);
                setPagination(attendanceResponse.data.pagination);
            }

            if (statsResponse.success) {
                setStats(statsResponse.data);
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to fetch attendance data",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const handleClockIn = async (): Promise<AttendanceRecord> => {
        try {
            const response = await attendanceService.clockIn();
            toast({
                title: "Success",
                description: "Successfully clocked in",
            });
            await fetchAttendance({});
            return response;
        } catch (err) {
            console.error('Clock in error:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to clock in",
            });
            throw err;
        }
    };

    const handleClockOut = async (): Promise<AttendanceRecord> => {
        try {
            const response = await attendanceService.clockOut();
            toast({
                title: "Success",
                description: "Successfully clocked out",
            });
            await fetchAttendance({});
            return response;
        } catch (err) {
            console.error('Clock out error:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to clock out",
            });
            throw err;
        }
    };

    const handleExport = async (
        format: 'csv' | 'pdf',
        params: {
            dateRange?: DateRange;
            departmentId?: string;
            status?: string;
        }
    ): Promise<void> => {
        try {
            await attendanceService.exportAttendance(format, {
                startDate: params.dateRange?.from,
                endDate: params.dateRange?.to,
                department_id: params.departmentId === 'all' ? undefined : params.departmentId,
                status: params.status === 'all' ? undefined : params.status,
            });

            toast({
                title: "Success",
                description: `Successfully exported attendance data as ${format.toUpperCase()}`,
            });
        } catch (err) {
            console.error('Export error:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : `Failed to export as ${format.toUpperCase()}`,
            });
            throw err;
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return {
        data,
        stats,
        departments,
        pagination,
        loading,
        fetchAttendance,
        handleClockIn,
        handleClockOut,
        handleExport,
        fetchDepartments,
    };
}