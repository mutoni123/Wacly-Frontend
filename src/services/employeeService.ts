// services/employeeService.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Types
export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    departmentId: string;
    departmentName: string;
    status: 'active' | 'inactive';
    joinDate: string;
    salary: number;
    position: string;
    avatar?: string;
}

export interface EmployeeFilters {
    department?: string;
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Service methods
export const employeeService = {
    // Get all employees with pagination and filters
    getAllEmployees: async (filters: EmployeeFilters = {}): Promise<PaginatedResponse<Employee>> => {
        try {
            const response = await api.get('/employees', { params: filters });
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch employees');
        }
    },

    // Get single employee by ID
    getEmployeeById: async (id: string): Promise<Employee> => {
        try {
            const response = await api.get(`/employees/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch employee');
        }
    },

    // Create new employee
    createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
        try {
            const response = await api.post('/employees', data);
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to create employee');
        }
    },

    // Update employee
    updateEmployee: async (id: string, data: Partial<Employee>): Promise<Employee> => {
        try {
            const response = await api.put(`/employees/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update employee');
        }
    },

    // Delete employee
    deleteEmployee: async (id: string): Promise<void> => {
        try {
            await api.delete(`/employees/${id}`);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to delete employee');
        }
    },

    // Bulk delete employees
    bulkDeleteEmployees: async (ids: string[]): Promise<void> => {
        try {
            await api.post('/employees/bulk-delete', { ids });
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to delete employees');
        }
    },

    // Update employee status
    updateEmployeeStatus: async (id: string, status: 'active' | 'inactive'): Promise<Employee> => {
        try {
            const response = await api.patch(`/employees/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update employee status');
        }
    },

    // Upload employee avatar
    uploadAvatar: async (id: string, file: File): Promise<{ avatarUrl: string }> => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await api.post(`/employees/${id}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to upload avatar');
        }
    },

    // Get employee statistics
    getEmployeeStats: async (): Promise<{
        totalEmployees: number;
        activeEmployees: number;
        inactiveEmployees: number;
        departmentDistribution: { [key: string]: number };
        roleDistribution: { [key: string]: number };
    }> => {
        try {
            const response = await api.get('/employees/stats');
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch employee statistics');
        }
    },

    // Get employee attendance
    getEmployeeAttendance: async (
        employeeId: string,
        startDate: string,
        endDate: string
    ): Promise<{
        present: number;
        absent: number;
        late: number;
        records: Array<{
            date: string;
            status: 'present' | 'absent' | 'late';
            checkIn: string;
            checkOut: string;
        }>;
    }> => {
        try {
            const response = await api.get(`/employees/${employeeId}/attendance`, {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch attendance records');
        }
    },

    // Get employee leave records
    getEmployeeLeave: async (
        employeeId: string,
        year?: number
    ): Promise<{
        totalLeaves: number;
        takenLeaves: number;
        remainingLeaves: number;
        leaveHistory: Array<{
            id: string;
            type: string;
            startDate: string;
            endDate: string;
            status: 'approved' | 'pending' | 'rejected';
            reason: string;
        }>;
    }> => {
        try {
            const response = await api.get(`/employees/${employeeId}/leave`, {
                params: { year },
            });
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch leave records');
        }
    },

    // Get employee performance reviews
    getEmployeePerformance: async (
        employeeId: string
    ): Promise<Array<{
        id: string;
        date: string;
        rating: number;
        feedback: string;
        reviewer: string;
        goals: Array<{ goal: string; status: 'completed' | 'in-progress' | 'not-started' }>;
    }>> => {
        try {
            const response = await api.get(`/employees/${employeeId}/performance`);
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch performance reviews');
        }
    },

    // Export employees data
    exportEmployees: async (format: 'csv' | 'excel', filters?: EmployeeFilters): Promise<Blob> => {
        try {
            const response = await api.get(`/employees/export/${format}`, {
                params: filters,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to export employees data');
        }
    },

    // Import employees data
    importEmployees: async (file: File): Promise<{
        succeeded: number;
        failed: number;
        errors: Array<{ row: number; error: string }>;
    }> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/employees/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to import employees data');
        }
    }
};