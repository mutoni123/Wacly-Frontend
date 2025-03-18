// hooks/team-attendance-hook.ts
import { useState, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { format as formatDate } from 'date-fns';
import { toast } from '@/hooks/use-toast';

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

interface AttendanceStats {
    presentToday: number;
    absentToday: number;
    lateToday: number;
    totalHours: number;
    averageHoursPerDay: number;
}

interface PaginationInfo {
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface FetchParams {
    dateRange?: DateRange;
    status?: string;
    page?: number;
    limit?: number;
}

interface ExportParams {
    dateRange?: DateRange;
    status?: string;
    format: 'csv' | 'pdf';
}

interface AttendanceResponse {
    success: boolean;
    data: {
        attendance: AttendanceRecord[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
        };
    };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export function useTeamAttendance() {
    const [data, setData] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const getAuthToken = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    };

    const fetchTeamAttendance = useCallback(async (params: FetchParams) => {
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
            if (params.status && params.status !== 'all') {
                queryParams.append('status', params.status === 'In Progress' ? 'In Progress' : 'Completed');
            }
            if (params.page) {
                queryParams.append('page', params.page.toString());
            }
            if (params.limit) {
                queryParams.append('limit', params.limit.toString());
            }

            console.log('Fetching attendance with params:', queryParams.toString());

            const response = await fetch(
                `${API_BASE}/api/attendance/department?${queryParams.toString()}`,
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
                throw new Error('Failed to fetch attendance data');
            }

            const result: AttendanceResponse = await response.json();
            console.log('API Response:', result);

            if (result.success) {
                setData(result.data.attendance);
                setPagination({
                    page: result.data.pagination.page,
                    totalPages: result.data.pagination.totalPages,
                    hasNextPage: result.data.pagination.page < result.data.pagination.totalPages,
                    hasPreviousPage: result.data.pagination.page > 1
                });
                
                // Fetch statistics
                await fetchStatistics();
            } else {
                throw new Error('Failed to fetch attendance data');
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
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

    const fetchStatistics = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/api/attendance/statistics`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }

            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    const updateAttendance = async (id: string, updateData: Partial<AttendanceRecord>) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/api/attendance/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to update attendance');
            }

            const result = await response.json();
            if (result.success) {
                toast({
                    description: "Attendance updated successfully",
                });
                // Update local data
                setData(currentData => currentData.map(record => 
                    record.id === id ? { ...record, ...result.data } : record
                ));
            } else {
                throw new Error(result.message || 'Failed to update attendance');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update attendance';
            toast({
                description: errorMessage,
                variant: "destructive",
            });
            throw err;
        }
    };

    const handleExport = async (exportFormat: 'csv' | 'pdf', params: Omit<ExportParams, 'format'>) => {
        try {
            const token = getAuthToken();
            const queryParams = new URLSearchParams();
    
            if (params.dateRange?.from) {
                queryParams.append('startDate', formatDate(params.dateRange.from, 'yyyy-MM-dd'));
            }
            if (params.dateRange?.to) {
                queryParams.append('endDate', formatDate(params.dateRange.to, 'yyyy-MM-dd'));
            }
            if (params.status && params.status !== 'all') {
                queryParams.append('status', params.status);
            }
    
            // Get the report data
            const response = await fetch(
                `${API_BASE}/api/attendance/report?${queryParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
    
            if (!response.ok) {
                throw new Error('Failed to export attendance data');
            }
    
            interface AttendanceReportData {
                success: boolean;
                data: {
                    attendance: Array<{
                        session_date: string;
                        user: {
                            first_name: string;
                            last_name: string;
                            department_id: string;
                        };
                        clock_in: string | null;
                        clock_out: string | null;
                        duration: number | null;
                        status: string;
                    }>;
                };
                message?: string;
            }
    
            const result: AttendanceReportData = await response.json();
    
            if (!result.success) {
                throw new Error(result.message || 'Failed to export attendance data');
            }
    
            // Convert data to CSV format
            const attendance = result.data.attendance;
            const csvData = [
                // CSV Headers
                ['Date', 'Employee Name', 'Department', 'Clock In', 'Clock Out', 'Duration (hrs)', 'Status'].join(','),
                // CSV Rows
                ...attendance.map((record) => [
                    record.session_date,
                    `${record.user.first_name} ${record.user.last_name}`,
                    record.user.department_id,
                    record.clock_in ? formatDate(new Date(record.clock_in), 'HH:mm') : '-',
                    record.clock_out ? formatDate(new Date(record.clock_out), 'HH:mm') : '-',
                    record.duration ? (record.duration / 60).toFixed(2) : '-',
                    record.status
                ].join(','))
            ].join('\n');
    
            // Create and trigger download
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-report-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
    
            toast({
                description: `Attendance report exported successfully as CSV`,
            });
        } catch (err) {
            console.error('Export error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to export attendance data';
            toast({
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    return {
        data,
        stats,
        loading,
        error,
        pagination,
        fetchTeamAttendance,
        updateAttendance,
        handleExport,
    };
}