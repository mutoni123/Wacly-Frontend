"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit, Trash, Mail, ArrowRightLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  managerId: string;
  managerName: string;
  budget: number;
  activeProjects: number;
  averagePerformance: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  departmentId: string;
}

interface DepartmentAnalytics {
  totalEmployees: number;
  averagePerformance: number;
  totalBudget: number;
  activeProjects: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | null>(null);
  const [analytics, setAnalytics] = useState<DepartmentAnalytics | null>(null);
  
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

  const [announcementData, setAnnouncementData] = useState({
    departmentId: '',
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
    fetchEmployees();
    fetchDepartmentAnalytics(); // Now works without argument
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch {
      toast.error('Failed to fetch departments');
    }
  };
  

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/employees?role=manager');
      const data = await response.json();
      setManagers(data.employees);
    } catch {
      toast.error('Failed to fetch managers');
    }
  };
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data.employees);
    } catch {
      toast.error('Failed to fetch employees');
    }
  };
  
  const handleDelete = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete department');
    }
  };
  
  // Update the fetchDepartmentAnalytics function
  const fetchDepartmentAnalytics = async (departmentId?: string) => {
    try {
      const url = departmentId 
        ? `/api/departments/${departmentId}/analytics`
        : '/api/departments/analytics';
      
      const response = await fetch(url);
      const data = await response.json();
      setAnalytics(data);
    } catch {
      toast.error('Failed to fetch department analytics');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalType === 'edit' ? `/api/departments/${formData.id}` : '/api/departments';
    const method = modalType === 'edit' ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error();
      toast.success(`Department ${modalType === 'edit' ? 'updated' : 'created'}`);
      setIsModalOpen(false);
      fetchDepartments();
    } catch {
      toast.error('Failed to process department');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/departments/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      });
      
      if (!response.ok) throw new Error();
      toast.success('Employee transfer request submitted');
      setIsTransferModalOpen(false);
    } catch {
      toast.error('Failed to submit transfer request');
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/departments/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      });
      
      if (!response.ok) throw new Error();
      toast.success('Announcement sent');
      setIsAnnouncementModalOpen(false);
    } catch {
      toast.error('Failed to send announcement');
    }
  };

  // Add click handler for department-specific analytics
  const handleDepartmentClick = (dept: Department) => {
    fetchDepartmentAnalytics(dept.id);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Departments</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            className="w-full sm:w-auto justify-center"
            onClick={() => { setModalType('add'); setIsModalOpen(true); }}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Department
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto justify-center"
            onClick={() => setIsTransferModalOpen(true)}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfer
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto justify-center"
            onClick={() => setIsAnnouncementModalOpen(true)}
          >
            <Mail className="h-4 w-4 mr-2" /> Announce
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-none">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card 
                key={dept.id} 
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleDepartmentClick(dept)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{dept.name}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" 
                        onClick={() => { setFormData(dept); setModalType('view'); setIsModalOpen(true); }}>
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" 
                        onClick={() => { setFormData(dept); setModalType('edit'); setIsModalOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(dept.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Employees:</span>
                      <span>{dept.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manager:</span>
                      <span>{dept.managerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Projects:</span>
                      <span>{dept.activeProjects}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalEmployees || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.averagePerformance || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Ksh {analytics?.totalBudget?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.activeProjects || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Department Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modalType === 'edit' ? 'Edit' : modalType === 'view' ? 'View' : 'Add'} Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label>Department Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                  disabled={modalType === 'view'}
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={modalType === 'view'}
                />
              </div>

              <div>
                <Label>Manager</Label>
                <Select 
                  value={formData.managerId} 
                  onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                  disabled={modalType === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Budget</Label>
                <Input 
                  type="number"
                  value={formData.budget} 
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  disabled={modalType === 'view'}
                />
              </div>
            </div>
            
            {modalType !== 'view' && (
              <DialogFooter className="mt-4">
                <Button type="submit">{modalType === 'edit' ? 'Update' : 'Create'} Department</Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={transferData.employeeId}
                onValueChange={(value) => setTransferData({ ...transferData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>To Department</Label>
              <Select
                value={transferData.toDepartmentId}
                onValueChange={(value) => setTransferData({ ...transferData, toDepartmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Reason for Transfer</Label>
              <Textarea
                value={transferData.reason}
                onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                placeholder="Explain the reason for transfer"
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit">Submit Transfer Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Announcement Modal */}
      <Dialog open={isAnnouncementModalOpen} onOpenChange={setIsAnnouncementModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Department Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div>
              <Label>Department</Label>
              <Select
                value={announcementData.departmentId}
                onValueChange={(value) => setAnnouncementData({ ...announcementData, departmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={announcementData.title}
                onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                placeholder="Announcement title"
                required
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={announcementData.message}
                onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                placeholder="Write your announcement message"
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit">Send Announcement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}