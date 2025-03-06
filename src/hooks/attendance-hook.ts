import { useState, useCallback, useEffect } from 'react';
import { 
  attendanceService, 
  AttendanceRecord, 
  AttendanceStats,
  Department 
} from '@/services/attendanceService';
import { DateRange } from 'react-day-picker';
import { useToast } from "@/hooks/use-toast";

export function useAttendance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const fetchDepartments = useCallback(async () => {
    try {
      const departmentsData = await attendanceService.getDepartments();
      setDepartments(departmentsData);
    } catch (err) {
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
  }: {
    page?: number;
    limit?: number;
    dateRange?: DateRange;
    departmentId?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);

      const [attendanceResponse, statsResponse] = await Promise.all([
        // Fetch attendance data
        attendanceService.getAllAttendance({
          page,
          limit,
          startDate: dateRange?.from,
          endDate: dateRange?.to,
          department_id: departmentId === 'all' ? undefined : departmentId,
          status: status === 'all' ? undefined : status,
        }),
        // Fetch statistics
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
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch attendance data",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleClockIn = async () => {
    try {
      const response = await attendanceService.clockIn();
      toast({
        title: "Success",
        description: "Successfully clocked in",
      });
      // Refresh attendance data
      fetchAttendance({});
      return response;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to clock in",
      });
      throw err;
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await attendanceService.clockOut();
      toast({
        title: "Success",
        description: "Successfully clocked out",
      });
      // Refresh attendance data
      fetchAttendance({});
      return response;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to clock out",
      });
      throw err;
    }
  };

  const handleExport = async (format: 'csv' | 'pdf', params: {
    dateRange?: DateRange;
    departmentId?: string;
    status?: string;
  }) => {
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
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to export as ${format.toUpperCase()}`,
      });
      throw err;
    }
  };

  // Fetch departments on mount
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