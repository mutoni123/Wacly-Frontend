// services/departmentService.ts
import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface Manager {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

export interface Department {
    id: number;
    name: string;
    description: string;
    manager_id: string | null;
    budget: number;
    created_at: string;
    updated_at: string;
    employee_count?: number;
    manager?: Manager;
}

export interface DepartmentFormData {
    name: string;
    description: string;
    manager_id: string | null;
    budget: number;
}

// Error handling
const handleApiError = (error: unknown, defaultMessage: string): never => {
    if (error instanceof AxiosError) {
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.response?.data?.message || error.message
        });
        throw new Error(error.response?.data?.message || defaultMessage);
    }
    throw new Error(error instanceof Error ? error.message : defaultMessage);
};

// Auth token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
        });
        return Promise.reject(error);
    }
);

export const departmentService = {
    getAllDepartments: async (): Promise<Department[]> => {
        try {
            const response = await api.get<Department[]>('/departments');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch departments');
        }
    },

    getAllManagers: async (): Promise<Manager[]> => {
        try {
            const response = await api.get<Manager[]>('/users/managers');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch managers');
        }
    },

    createDepartment: async (data: DepartmentFormData): Promise<Department> => {
        try {
            const response = await api.post<Department>('/departments', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to create department');
        }
    },

    updateDepartment: async (id: number, data: Partial<DepartmentFormData>): Promise<Department> => {
        try {
            const response = await api.put<Department>(`/departments/${id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to update department');
        }
    },

    deleteDepartment: async (id: number): Promise<void> => {
        try {
            await api.delete(`/departments/${id}`);
        } catch (error) {
            throw handleApiError(error, 'Failed to delete department');
        }
    },

    // Helper methods
    getManagerFullName: (manager?: Manager): string => {
        if (!manager) return 'No manager assigned';
        return `${manager.first_name} ${manager.last_name}`;
    },

    formatDate: (date: string): string => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};