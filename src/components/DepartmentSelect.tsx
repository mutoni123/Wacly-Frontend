// components/DepartmentSelect.tsx
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

interface Department {
  id: string;
  name: string;
}

interface DepartmentSelectProps {
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function DepartmentSelect({ 
  value, 
  onSelect, 
  disabled, 
  className 
}: DepartmentSelectProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/api/departments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        // Handle unauthorized access
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch departments');
        }

        const data = await response.json();
        setDepartments(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error('Department fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch departments';
        setError(errorMessage);
        toast.error(errorMessage);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Select disabled value="">
        <SelectTrigger className={className}>
          <SelectValue placeholder="Error loading departments" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select 
      value={value} 
      onValueChange={onSelect} 
      disabled={disabled || departments.length === 0}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={
          departments.length === 0 
            ? "No departments available" 
            : "Select department"
        } />
      </SelectTrigger>
      <SelectContent>
        {departments.map(department => (
          <SelectItem 
            key={department.id} 
            value={department.id}
          >
            {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}