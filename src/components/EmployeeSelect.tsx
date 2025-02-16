// components/EmployeeSelect.tsx
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

interface Employee {
  id: string;
  name: string;
  departmentId: string;
}

interface EmployeeSelectProps {
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  employees?: Employee[]; // Optional prop for pre-loaded employees
}

export default function EmployeeSelect({ value, onSelect, disabled, employees }: EmployeeSelectProps) {
  const [internalEmployees, setInternalEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employees) {
      fetch('/api/employees')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch employees');
          return res.json();
        })
        .then(data => setInternalEmployees(data.employees))
        .catch(error => toast.error(error.message))
        .finally(() => setLoading(false));
    } else {
      setInternalEmployees(employees);
      setLoading(false);
    }
  }, [employees]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select employee" />
      </SelectTrigger>
      <SelectContent>
        {internalEmployees.map(employee => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}