// hooks/employee-hook.ts
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  position: string;
  status: 'active' | 'inactive';
}

interface EmployeeResponse {
  success: boolean;
  data: {
    employees: Employee[];
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  };

  const fetchDepartmentEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_BASE}/api/employees/department`,
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
        throw new Error('Failed to fetch department employees');
      }

      const result: EmployeeResponse = await response.json();

      if (result.success) {
        setEmployees(result.data.employees);
      } else {
        throw new Error('Failed to fetch department employees');
      }
    } catch (err) {
      console.error('Error fetching department employees:', err);
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

  return {
    employees,
    loading,
    error,
    fetchDepartmentEmployees,
  };
}