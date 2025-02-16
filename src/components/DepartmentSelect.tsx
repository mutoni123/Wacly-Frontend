// components/DepartmentSelect.tsx
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

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

export default function DepartmentSelect({ value, onSelect, disabled, className }: DepartmentSelectProps) {
  const [internalDepartments, setInternalDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch departments');
        return res.json();
      })
      .then(data => {
        setInternalDepartments(data);
        setLoading(false);
      })
      .catch(error => {
        toast.error(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select department" />
      </SelectTrigger>
      <SelectContent>
        {internalDepartments.map(department => (
          <SelectItem key={department.id} value={department.id}>
            {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}