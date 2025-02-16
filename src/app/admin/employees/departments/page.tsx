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
      const response = await fetch(`http://localhost:5000/api/departments`);
      if (!response.ok) throw new Error('Failed to fetch departments');
      setDepartments(await response.json());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch departments');
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees?role=manager`);
      if (!response.ok) throw new Error('Failed to fetch managers');
      const data = await response.json();
      setManagers(data.employees);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch managers');
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data.employees);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch employees');
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchDepartments(), fetchManagers(), fetchEmployees()]);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to initialize data');
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [fetchDepartments, fetchManagers, fetchEmployees]);

  const handleDepartmentAction = async (
    action: 'create' | 'update' | 'delete',
    data: Partial<Department> & { id?: string }
  ) => {
    try {
      const method = action === 'delete' ? 'DELETE' : action === 'update' ? 'PUT' : 'POST';
      const url = action === 'delete' ? `$http://localhost:5000/api/departments/${data.id}` :
        action === 'update' ? `$http://localhost:5000/api/departments/${data.id}` : `http://localhost:5000/api/departments`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(data) : null
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      toast.success(`Department ${action}d successfully`);
      await Promise.all([fetchDepartments(), fetchManagers()]);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
      return false;
    }
  };

  const handleManagerUpdate = async (departmentId: string, managerId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${departmentId}/manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId })
      });

      if (!response.ok) throw new Error('Failed to update manager');
      
      toast.success('Manager updated successfully');
      await Promise.all([fetchDepartments(), fetchManagers()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update manager');
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
      const response = await fetch(`http://localhost:5000/api/departments/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: transferData.employeeId,
          toDepartmentId: transferData.toDepartmentId,
          reason: transferData.reason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit transfer request');
      }

      toast.success('Employee transfer request submitted successfully');
      setIsTransferModalOpen(false);
      setTransferData({ employeeId: '', fromDepartmentId: '', toDepartmentId: '', reason: '' });
      await Promise.all([fetchDepartments(), fetchEmployees()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit transfer request');
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
            <TableHead>Budget</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium">{department.name}</TableCell>
              <TableCell>
                <Select
                  value={department.managerId}
                  onValueChange={(value) => handleManagerUpdate(department.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        <div className="flex items-center gap-2">
                          <span>{manager.name}</span>
                          <span className="text-muted-foreground text-sm">
                            ({manager.email})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>Ksh {department.budget.toLocaleString()}</TableCell>
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
                        <div className="flex items-center gap-2">
                          <span>{manager.name}</span>
                          <span className="text-muted-foreground text-sm">
                            ({manager.email})
                          </span>
                        </div>
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target department" />
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