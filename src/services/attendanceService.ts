import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// PDF AutoTable types
type AutoTableTheme = 'striped' | 'grid' | 'plain';

interface AutoTableSettings {
  head: string[][];
  body: string[][];
  startY: number;
  theme: AutoTableTheme;
  styles: {
    fontSize: number;
    cellPadding?: number;
  };
  headStyles: {
    fillColor: number[];
    textColor: number;
    fontStyle?: 'bold';
  };
  alternateRowStyles: {
    fillColor: number[];
  };
  margin?: { top: number };
}

// Core interfaces
export interface AttendanceRecord {
  id: number;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  duration: number | null;
  status: 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_id: string;
  };
}

export interface AttendanceStats {
  totalDays: number;
  totalHours: number;
  averageHoursPerDay: number;
}

export interface AttendanceResponse {
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

class AttendanceService {
  private getHeaders(accept?: string) {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(accept && { Accept: accept }),
    };
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

  async getAllAttendance(params: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    department_id?: string;
    status?: string;
  }) {
    try {
      const response = await axios.get<AttendanceResponse>(
        `${API_BASE}/api/attendance/all`,
        {
          headers: this.getHeaders(),
          params: {
            ...params,
            startDate: params.startDate?.toISOString(),
            endDate: params.endDate?.toISOString(),
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Failed to fetch attendance data');
    }
  }

  async getStatistics(params: {
    startDate?: Date;
    endDate?: Date;
    department_id?: string;
  }) {
    try {
      const response = await axios.get<{ success: boolean; data: AttendanceStats }>(
        `${API_BASE}/api/attendance/statistics`,
        {
          headers: this.getHeaders(),
          params: {
            ...params,
            startDate: params.startDate?.toISOString(),
            endDate: params.endDate?.toISOString(),
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Failed to fetch attendance statistics');
    }
  }

  async getDepartments() {
    try {
      const response = await axios.get<Department[]>(
        `${API_BASE}/api/departments`,
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Failed to fetch departments');
    }
  }

  private async generateCSV(data: AttendanceRecord[], dateStr: string) {
    try {
      const csvData = data.map(record => ({
        'Employee Name': `${record.user.first_name} ${record.user.last_name}`,
        'Employee Email': record.user.email,
        'Date': this.formatDate(record.created_at),
        'Clock In': this.formatTime(record.clock_in),
        'Clock Out': record.clock_out ? this.formatTime(record.clock_out) : '-',
        'Duration': this.formatDuration(record.duration),
        'Status': record.status
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      this.createDownloadLink(blob, `attendance_report_${dateStr}.csv`);
    } catch (error) {
      console.error('CSV Generation Error:', error);
      throw new Error('Failed to generate CSV');
    }
  }

  private async generatePDF(
    data: AttendanceRecord[],
    dateStr: string,
    params: ExportParams
  ) {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text('Attendance Report', 14, 15);

      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
      if (params.startDate) {
        doc.text(`Period: ${this.formatDate(params.startDate.toISOString())} - ${
          params.endDate ? this.formatDate(params.endDate.toISOString()) : 'Present'
        }`, 14, 30);
      }

      // Prepare table data
      const tableData = data.map(record => [
        `${record.user.first_name} ${record.user.last_name}`,
        record.user.email,
        this.formatDate(record.created_at),
        this.formatTime(record.clock_in),
        record.clock_out ? this.formatTime(record.clock_out) : '-',
        this.formatDuration(record.duration),
        record.status
      ]);

      // Generate table
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
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 35 },
      });

      // Save PDF
      doc.save(`attendance_report_${dateStr}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  async exportAttendance(format: 'csv' | 'pdf', params: ExportParams) {
    try {
      const response = await axios.get<AttendanceResponse>(
        `${API_BASE}/api/attendance/all`,
        {
          headers: this.getHeaders(),
          params: {
            ...params,
            startDate: params.startDate?.toISOString(),
            endDate: params.endDate?.toISOString(),
            limit: 1000,
          },
        }
      );

      if (!response.data.success || !response.data.data.attendance) {
        throw new Error('No data available for export');
      }

      const data = response.data.data.attendance;
      const dateStr = new Date().toISOString().split('T')[0];

      if (format === 'csv') {
        await this.generateCSV(data, dateStr);
      } else {
        await this.generatePDF(data, dateStr, params);
      }
    } catch (error) {
      console.error('Export Error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error(`Failed to export attendance data as ${format.toUpperCase()}`);
    }
  }

  async clockIn() {
    try {
      const response = await axios.post(
        `${API_BASE}/api/attendance/clock-in`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Failed to clock in');
    }
  }

  async clockOut() {
    try {
      const response = await axios.post(
        `${API_BASE}/api/attendance/clock-out`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Failed to clock out');
    }
  }
}

export const attendanceService = new AttendanceService();