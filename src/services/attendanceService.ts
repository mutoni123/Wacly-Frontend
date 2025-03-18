// src/services/attendanceService.ts
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// Types and Interfaces
type Color = [number, number, number];

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_id: string;
}

export interface AttendanceRecord {
    id: number;
    user_id: string;
    clock_in: string;
    clock_out: string | null;
    duration: number | null;
    status: 'In Progress' | 'Completed';
    session_date: string;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface AttendanceStats {
    totalDays: number;
    totalHours: number;
    averageHoursPerDay: number;
}

export interface Pagination {
    total: number;
    page: number;
    totalPages: number;
}

export interface AttendanceResponse {
    success: boolean;
    data: {
        attendance: AttendanceRecord[];
        pagination: Pagination;
    };
}

export interface Department {
    id: string;
    name: string;
    description: string;
    manager_id: string;
    created_at: string;
    updated_at: string;
    employee_count: number;
    manager?: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
    };
}

interface ExportParams {
    startDate?: Date;
    endDate?: Date;
    department_id?: string;
    status?: string;
}

interface FetchParams extends ExportParams {
    page?: number;
    limit?: number;
}

class AttendanceService {
    private getHeaders(accept?: string): Record<string, string> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(accept && { Accept: accept }),
        };
    }

    private handleError(error: unknown, defaultMessage: string): never {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error(error.response?.data?.message || defaultMessage);
        }
        throw new Error(defaultMessage);
    }

    private formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    private formatTime(date: string): string {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private formatDuration(minutes: number | null): string {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    private createDownloadLink(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async getActiveSession(): Promise<AttendanceResponse> {
        try {
            const response = await axios.get<AttendanceResponse>(
                `${API_BASE}/api/attendance/active-session`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (err: unknown) {
            return this.handleError(err, 'Failed to fetch active session');
        }
    }

    async getAllAttendance(params: FetchParams): Promise<AttendanceResponse> {
        try {
            const response = await axios.get<AttendanceResponse>(
                `${API_BASE}/api/attendance/all`,
                {
                    headers: this.getHeaders(),
                    params: {
                        ...params,
                        startDate: params.startDate?.toISOString().split('T')[0],
                        endDate: params.endDate?.toISOString().split('T')[0],
                    },
                }
            );
            return response.data;
        } catch (err: unknown) {
            return this.handleError(err, 'Failed to fetch attendance data');
        }
    }

    async getStatistics(params: ExportParams): Promise<{ success: boolean; data: AttendanceStats }> {
        try {
            const response = await axios.get<{ success: boolean; data: AttendanceStats }>(
                `${API_BASE}/api/attendance/statistics`,
                {
                    headers: this.getHeaders(),
                    params: {
                        ...params,
                        startDate: params.startDate?.toISOString().split('T')[0],
                        endDate: params.endDate?.toISOString().split('T')[0],
                    },
                }
            );
            return response.data;
        } catch (err: unknown) {
            return this.handleError(err, 'Failed to fetch attendance statistics');
        }
    }

    async getDepartments(): Promise<Department[]> {
        try {
            const response = await axios.get<{ success: boolean; data: Department[] }>(
                `${API_BASE}/api/departments`,
                { headers: this.getHeaders() }
            );
            return response.data.data;
        } catch (err: unknown) {
            return this.handleError(err, 'Failed to fetch departments');
        }
    }

    async clockIn(): Promise<AttendanceRecord> {
        try {
            const response = await axios.post<{ success: boolean; data: AttendanceRecord }>(
                `${API_BASE}/api/attendance/clock-in`,
                {},
                { headers: this.getHeaders() }
            );
            return response.data.data;
        } catch (err: unknown) {
            return this.handleError(err, 'Failed to clock in');
        }
    }

    async clockOut(): Promise<AttendanceRecord> {
        try {
            const response = await axios.post<{ success: boolean; data: AttendanceRecord }>(
                `${API_BASE}/api/attendance/clock-out`,
                {},
                { headers: this.getHeaders() }
            );
            return response.data.data;
        } catch (err: unknown) {
            return this.handleError(err, 'Failed to clock out');
        }
    }

    private async generateCSV(data: AttendanceRecord[], dateStr: string): Promise<void> {
        try {
            const csvData = data.map(record => ({
                'Employee Name': `${record.user.first_name} ${record.user.last_name}`,
                'Employee Email': record.user.email,
                'Date': this.formatDate(record.session_date),
                'Clock In': this.formatTime(record.clock_in),
                'Clock Out': record.clock_out ? this.formatTime(record.clock_out) : '-',
                'Duration': this.formatDuration(record.duration),
                'Status': record.status
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            this.createDownloadLink(blob, `attendance_report_${dateStr}.csv`);
        } catch (err: unknown) {
            console.error('CSV Generation Error:', err);
            throw new Error('Failed to generate CSV');
        }
    }

    private async generatePDF(
        data: AttendanceRecord[],
        dateStr: string,
        params: ExportParams
    ): Promise<void> {
        try {
            const doc = new jsPDF();

            doc.setFontSize(16);
            doc.text('Attendance Report', 14, 15);

            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

            if (params.startDate) {
                doc.text(
                    `Period: ${this.formatDate(params.startDate.toISOString())} - ${
                        params.endDate ? this.formatDate(params.endDate.toISOString()) : 'Present'
                    }`,
                    14,
                    30
                );
            }

            const tableData = data.map(record => [
                `${record.user.first_name} ${record.user.last_name}`,
                record.user.email,
                this.formatDate(record.session_date),
                this.formatTime(record.clock_in),
                record.clock_out ? this.formatTime(record.clock_out) : '-',
                this.formatDuration(record.duration),
                record.status
            ]);

            autoTable(doc, {
                head: [['Name', 'Email', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Status']],
                body: tableData,
                startY: 35,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [41, 128, 185] as Color,
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245] as Color,
                },
                margin: { top: 35 },
            });

            doc.save(`attendance_report_${dateStr}.pdf`);
        } catch (err: unknown) {
            console.error('PDF Generation Error:', err);
            throw new Error('Failed to generate PDF');
        }
    }

    async exportAttendance(format: 'csv' | 'pdf', params: ExportParams): Promise<void> {
        try {
            const response = await this.getAllAttendance({
                ...params,
                limit: 1000,
            });

            if (!response.success || !response.data.attendance) {
                throw new Error('No data available for export');
            }

            const data = response.data.attendance;
            const dateStr = new Date().toISOString().split('T')[0];

            if (format === 'csv') {
                await this.generateCSV(data, dateStr);
            } else {
                await this.generatePDF(data, dateStr, params);
            }
        } catch (err: unknown) {
            console.error('Export Error:', err);
            return this.handleError(err, `Failed to export attendance data as ${format.toUpperCase()}`);
        }
    }
}

export const attendanceService = new AttendanceService();