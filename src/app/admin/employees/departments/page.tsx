'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, ArrowRightLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';


interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  departmentId: string;
}

// Add interface for API response
interface UserAPIResponse {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  department_id: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  managerId: string;
  managerName: string;
  budget: number;
  activeProjects: number;
}

// Add interface for API response
interface DepartmentAPIResponse {
  id: string;
  name: string;
  description: string;
  employee_count: number;
  manager_id: string;
  manager_name: string;
  budget: number;
  active_projects: number;
}

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    managerId: '',
    budget: 0
  });

  const [transferData, setTransferData] = useState({
    employeeId: '',
    fromDepartmentId: '',
    toDepartmentId: '',
    reason: ''
  });

  const fetchDepartments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:5000/api/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      
      // Handle different possible response structures
      let departmentsData: DepartmentAPIResponse[] = [];
      if (Array.isArray(data)) {
        departmentsData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        departmentsData = data.data;
      } else if (data?.departments && Array.isArray(data.departments)) {
        departmentsData = data.departments;
      } else {
        throw new Error('Invalid departments data structure received');
      }

      // Transform the data to match our Department interface
      const transformedDepartments = departmentsData.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description || '',
        employeeCount: dept.employee_count || 0,
        managerId: dept.manager_id || '',
        managerName: dept.manager_name || '',
        budget: dept.budget || 0,
        activeProjects: dept.active_projects || 0
      }));

      setDepartments(transformedDepartments);
      return transformedDepartments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch departments');
      return [];
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:5000/api/users?role=manager`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch managers');
      }

      const data = await response.json();
      console.log('Managers API Response:', data); // Debug log
      
      // Handle different possible response structures
      let managersData: UserAPIResponse[] = [];
      if (Array.isArray(data)) {
        managersData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        managersData = data.data;
      } else if (data?.users && Array.isArray(data.users)) {
        managersData = data.users;
      } else {
        console.error('Invalid managers data structure:', data);
        throw new Error('Invalid managers data structure received');
      }

      // Transform the data to match our Employee interface
      const transformedManagers = managersData.map(manager => ({
        id: manager.id,
        name: `${manager.first_name} ${manager.last_name}`,
        role: manager.role,
        email: manager.email,
        departmentId: manager.department_id
      }));

      console.log('Transformed managers:', transformedManagers); // Debug log
      return transformedManagers;
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch managers');
      return [];
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:5000/api/users?role=employee`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      
      // Handle different possible response structures
      let employeesData: UserAPIResponse[] = [];
      if (Array.isArray(data)) {
        employeesData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        employeesData = data.data;
      } else if (data?.users && Array.isArray(data.users)) {
        employeesData = data.users;
      } else {
        throw new Error('Invalid employees data structure received');
      }

      // Transform the data to match our Employee interface
      const transformedEmployees = employeesData.map(employee => ({
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        role: employee.role,
        email: employee.email,
        departmentId: employee.department_id
      }));

      setEmployees(transformedEmployees);
      return transformedEmployees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch employees');
      return [];
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [departmentsResult, managersResult, employeesResult] = await Promise.all([
          fetchDepartments(),
          fetchManagers(),
          fetchEmployees()
        ]);

        // Only update state if component is still mounted
        if (isMounted) {
          // Update managers state first
          if (managersResult && managersResult.length > 0) {
            setManagers(managersResult);

            // Update departments with manager information
            const updatedDepartments = departmentsResult.map(dept => {
              const manager = managersResult.find(m => m.departmentId === dept.id);
              return {
                ...dept,
                managerId: manager?.id || dept.managerId || '',
                managerName: manager?.name || dept.managerName || ''
              };
            });
            setDepartments(updatedDepartments);
          }

          // Update employees state
          if (employeesResult && employeesResult.length > 0) {
            setEmployees(employeesResult);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [fetchDepartments, fetchManagers, fetchEmployees]);

  const handleDepartmentAction = async (
    action: 'create' | 'update' | 'delete',
    data: Partial<Department> & { id?: string }
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const method = action === 'delete' ? 'DELETE' : action === 'update' ? 'PUT' : 'POST';
      const url = action === 'delete' ? `http://localhost:5000/api/departments/${data.id}` :
        action === 'update' ? `http://localhost:5000/api/departments/${data.id}` : `http://localhost:5000/api/departments`;

      // If updating or creating, handle manager assignment
      if (method !== 'DELETE') {
        // If there's a manager being assigned
        if (data.managerId) {
          // Update the manager's department
          await fetch(`http://localhost:5000/api/users/${data.managerId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              department_id: data.id || data.department_id
            })
          });
        }

        // Update the department with manager information
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...data,
            manager_id: data.managerId
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Operation failed');
        }

        // Refresh all data to ensure consistency
        await Promise.all([fetchDepartments(), fetchManagers(), fetchEmployees()]);
      } else {
        // Handle deletion
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Operation failed');
        }

        // Refresh data after deletion
        await Promise.all([fetchDepartments(), fetchManagers(), fetchEmployees()]);
      }

      toast.success(`Department ${action}d successfully`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, ...submitData } = formData;
    const success = await handleDepartmentAction(
      modalType === 'edit' ? 'update' : 'create',
      { id, ...submitData }
    );

    if (success) {
      setIsModalOpen(false);
      setFormData({ id: '', name: '', description: '', managerId: '', budget: 0 });
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // First, update the employee's department
      const response = await fetch(`http://localhost:5000/api/users/${transferData.employeeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          department_id: transferData.toDepartmentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to transfer employee');
      }

      // If the employee is a manager, update the department's manager_id
      const employee = employees.find(e => e.id === transferData.employeeId);
      if (employee?.role === 'manager') {
        // Clear manager from old department
        if (transferData.fromDepartmentId) {
          await fetch(`http://localhost:5000/api/departments/${transferData.fromDepartmentId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              manager_id: null
            })
          });
        }

        // Set manager for new department
        await fetch(`http://localhost:5000/api/departments/${transferData.toDepartmentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            manager_id: transferData.employeeId
          })
        });
      }

      toast.success('Employee transferred successfully');
      setIsTransferModalOpen(false);
      setTransferData({ employeeId: '', fromDepartmentId: '', toDepartmentId: '', reason: '' });
      
      // Refresh data
      await Promise.all([fetchDepartments(), fetchEmployees(), fetchManagers()]);
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to transfer employee');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-gray-500 mt-1">Manage organizational departments</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => { setModalType('add'); setIsModalOpen(true); }}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Department
          </Button>
          <Button variant="outline" onClick={() => setIsTransferModalOpen(true)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfer
          </Button>
        </div>
      </div>

      {/* Departments Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium">{department.name}</TableCell>
              <TableCell>
                {department.managerName || 'No manager assigned'}
              </TableCell>
              <TableCell>{department.employeeCount}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFormData(department); setModalType('edit'); setIsModalOpen(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDepartmentAction('delete', { id: department.id })}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Department Modal */}
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'edit' ? 'Edit Department' : 'New Department'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label>Department Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label>Manager *</Label>
                <Select
                  value={formData.managerId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, managerId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Budget (Ksh)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">
                {modalType === 'edit' ? 'Update' : 'Create'} Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={() => setIsTransferModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Transfer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={transferData.employeeId}
                onValueChange={(value) => {
                  const employee = employees.find(e => e.id === value);
                  setTransferData(prev => ({
                    ...prev,
                    employeeId: value,
                    fromDepartmentId: employee?.departmentId || ''
                  }));
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <span>{employee.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ({employee.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Department</Label>
              <Select value={transferData.fromDepartmentId} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Automatically filled" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>To Department</Label>
              <Select
                value={transferData.toDepartmentId}
                onValueChange={(value) => setTransferData(prev => ({ ...prev, toDepartmentId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target department" />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter(dept => dept.id !== transferData.fromDepartmentId)
                    .map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Reason</Label>
              <Textarea
                value={transferData.reason}
                onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit">Submit Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 