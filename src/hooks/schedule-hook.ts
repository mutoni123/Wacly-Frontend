// hooks/schedule-hook.ts
import { useState, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { format as formatDate } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Schedule, ScheduleAssignmentData } from '@/types/schedule';

interface ScheduleResponse {
  success: boolean;
  data: {
    schedules: Schedule[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
}

interface ShiftResponse {
  success: boolean;
  data: {
    shifts: Array<{ id: string; name: string; }>;
  };
}

interface PaginationInfo {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: number;
}

interface FetchParams {
  dateRange?: DateRange;
  shiftId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ShiftFormData {
  name: string;
  start_time: string;
  end_time: string;
  max_employees: number;
  description?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export function useScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [shifts, setShifts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    items: 0
  });

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  };

  const fetchDepartmentShifts = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_BASE}/api/shifts/department`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch department shifts');
      }

      const result: ShiftResponse = await response.json();
      if (result.success) {
        setShifts(result.data.shifts);
      } else {
        throw new Error('Failed to fetch department shifts');
      }
    } catch (err) {
      console.error('Error fetching department shifts:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  const fetchDepartmentSchedules = useCallback(async (params: FetchParams) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      if (params.dateRange?.from) {
        queryParams.append('startDate', formatDate(params.dateRange.from, 'yyyy-MM-dd'));
      }
      if (params.dateRange?.to) {
        queryParams.append('endDate', formatDate(params.dateRange.to, 'yyyy-MM-dd'));
      }
      if (params.shiftId) {
        queryParams.append('shiftId', params.shiftId);
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const response = await fetch(
        `${API_BASE}/api/schedules/department?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch department schedules');
      }

      const result: ScheduleResponse = await response.json();
      if (result.success) {
        setSchedules(result.data.schedules);
        setPagination({
          page: result.data.pagination.page,
          totalPages: result.data.pagination.totalPages,
          hasNextPage: result.data.pagination.page < result.data.pagination.totalPages,
          hasPreviousPage: result.data.pagination.page > 1,
          items: result.data.pagination.total
        });
      } else {
        throw new Error('Failed to fetch department schedules');
      }
    } catch (err) {
      console.error('Error fetching department schedules:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createShift = useCallback(async (data: ShiftFormData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/shifts/department`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to create shift');
      }

      const result = await response.json();
      if (result.success) {
        toast({
          description: "Shift created successfully",
        });
        await fetchDepartmentShifts();
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create shift');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create shift';
      toast({
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchDepartmentShifts]);

  const assignSchedule = useCallback(async (data: ScheduleAssignmentData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/schedules/department/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to assign schedule');
      }

      const result = await response.json();
      if (result.success) {
        toast({
          description: "Schedule assigned successfully",
        });
        await fetchDepartmentSchedules({ page: pagination.page, limit: 10 });
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to assign schedule');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign schedule';
      toast({
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchDepartmentSchedules, pagination.page]);

  return {
    schedules,
    shifts,
    loading,
    error,
    pagination,
    fetchDepartmentShifts,
    fetchDepartmentSchedules,
    createShift,
    assignSchedule,
  };
}