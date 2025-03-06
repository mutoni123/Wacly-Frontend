import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseDepartmentAssignmentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useDepartmentAssignment({ onSuccess, onError }: UseDepartmentAssignmentProps = {}) {
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);

  const assignDepartment = useCallback(async (
    employeeId: string, 
    departmentId: string
  ) => {
    setIsAssigning(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/users/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department_id: departmentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign department');
      }

      toast({
        title: "Success",
        description: "Department assignment updated successfully",
        variant: "default",
      });

      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign department';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      onError?.(message);
    } finally {
      setIsAssigning(false);
    }
  }, [toast, onSuccess, onError]);

  return {
    isAssigning,
    assignDepartment
  };
}