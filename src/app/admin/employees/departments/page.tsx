'use client';


import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, MoreVertical, Edit, Trash, ArrowRightLeft } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

interface Department {
  id: string;
  name: string;
  description: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
  employee_count: number;
  manager?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface Manager {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id?: string;
}
interface TransferData {
  employeeId: string;
  fromDept: string;
  toDept: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function DepartmentPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',  name: '', description: '', managerId: ''});  
  const [chartDimensions, setChartDimensions] = useState({ width: 400, height: 300 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transferData, setTransferData] = useState<TransferData>({ employeeId: '', fromDept: '', toDept: '' });

  // Analytics sample data
  const deptData = [
    { name: 'IT', value: 15 },
    { name: 'HR', value: 8 },
    { name: 'Finance', value: 12 },
  ];
  const COLORS = ['#1e3a8a', '#1e40af', '#1d4ed8'];

  const fetchDepartments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
  
      setLoading(true);
      
      const response = await fetch(`${API_BASE}/api/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
  
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
  
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchManagers = useCallback(async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        window.location.href = '/login';
        return;
      }
  
      const response = await fetch(`${API_BASE}/api/users?role=manager`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      // Handle unauthorized access
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch managers');
      }
  
      const data = await response.json();
      
      // Update managers state based on API response structure
      const managersData = Array.isArray(data) ? data : data.users || [];
      setManagers(managersData.filter(user => user.role === 'manager'));
  
    } catch (err) {
      toast({
        title: "Authentication Error",
        description: "Please login to access this resource",
        variant: "destructive",
      });
      
      // Redirect to login if authentication fails
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, [toast]);
  
  // Update useEffect to include proper error handling
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }
  
    // Fetch data only if token exists
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchDepartments(),
          fetchManagers(),
          fetchEmployees()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [fetchDepartments, fetchManagers, fetchEmployees]);

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
    fetchEmployees();
  }, [fetchDepartments, fetchManagers, fetchEmployees]);

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id 
        ? `${API_BASE}/api/departments/${formData.id}`
        : `${API_BASE}/api/departments`;
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          manager_id: formData.managerId || null
        })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Operation failed');
      }
  
      toast({
        title: "Success",
        description: `Department ${formData.id ? 'updated' : 'created'} successfully`,
      });
  
      setIsDeptModalOpen(false);
      setFormData({ id: '', name: '', description: '', managerId: '' });
      fetchDepartments();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Operation failed',
        variant: "destructive",
      });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
  
      const response = await fetch(`${API_BASE}/api/departments/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: transferData.employeeId,
          to_department_id: transferData.toDept
        })
      });
  
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Transfer failed');
      }
  
      toast({
        title: "Success",
        description: "Employee transferred successfully",
        variant: "default",
      });
  
      setIsTransferModalOpen(false);
      setTransferData({
        employeeId: '',
        fromDept: '',
        toDept: ''
      });
  
      await Promise.all([
        fetchDepartments(),
        fetchEmployees()
      ]);
  
    } catch (err) {
      toast({
        title: "Transfer Failed",
        description: err instanceof Error 
          ? err.message 
          : "Failed to transfer employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    // Add confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this department? This action cannot be undone.');
    if (!confirmed) return;
  
    try {
      const response = await fetch(`${API_BASE}/api/departments/${departmentId}`, {
        method: 'DELETE',
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
        throw new Error(errorData.message || 'Failed to delete department');
      }
  
      // Success toast
      toast({
        title: "Department Deleted",
        description: "Department has been successfully deleted",
        variant: "default",
      });
  
      // Refresh departments data
      await fetchDepartments();
  
    } catch (err) {
      // Error toast
      toast({
        title: "Delete Failed",
        description: err instanceof Error 
          ? err.message 
          : "Failed to delete department. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const exportToPDF = async () => {
    const doc = new jsPDF();
    const input = document.getElementById('department-table');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 10, 190, 0);
    doc.save('departments.pdf');
  };

  const exportToCSV = () => {
    const csvData = departments.map(dept => ({
      'Department ID': dept.id,
      Name: dept.name,
      Description: dept.description,
      Manager: dept.manager 
        ? `${dept.manager.first_name} ${dept.manager.last_name}`
        : 'N/A',
      Employees: dept.employee_count
    }));
  
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'departments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) { // mobile
        setChartDimensions({ width: width - 40, height: 250 });
      } else if (width < 1024) { // tablet
        setChartDimensions({ width: (width / 2) - 60, height: 300 });
      } else { // desktop
        setChartDimensions({ width: 400, height: 300 });
      }
    };
  
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
          <p className="text-gray-500 mt-1">Organization department structure</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={exportToPDF} className="w-full sm:w-auto">Export PDF</Button>
          <Button onClick={exportToCSV} className="w-full sm:w-auto">Export CSV</Button>
          <Button 
            onClick={() => setIsDeptModalOpen(true)} 
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsTransferModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer Employee
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
        <div className="bg-white rounded-lg shadow-md overflow-x-auto" id="department-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-500 py-8">
                    {error}
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.description}</TableCell>
                    <TableCell>
                      {dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : 'Not assigned'}
                    </TableCell>
                    <TableCell>{dept.employee_count}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setIsDeptModalOpen(true);
                            setFormData({
                              id: dept.id,
                              name: dept.name,
                              description: dept.description,
                              managerId: dept.manager_id
                            });
                          }}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteDepartment(dept.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-x-auto">
            <h3 className="font-semibold mb-4">Employee Distribution</h3>
            <div className="min-w-[300px]">
              <PieChart width={chartDimensions.width} height={chartDimensions.height}>
                <Pie 
                  data={deptData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={chartDimensions.height * 0.25} 
                  fill="#3b82f6" 
                  dataKey="value" 
                  label
                >
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-x-auto">
            <h3 className="font-semibold mb-4">Department Performance</h3>
            <div className="min-w-[300px]">
              <BarChart 
                width={chartDimensions.width} 
                height={chartDimensions.height}
                data={deptData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </div>
          </div>
        </div>
        </TabsContent>
      </Tabs>

        {/* Add/Edit Department Modal */}
      <AnimatePresence>
        {isDeptModalOpen && (
          <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle>{formData.name ? 'Edit Department' : 'Create Department'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleDepartmentSubmit}>
                  <div className="grid gap-4 py-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                    >
                      <Label htmlFor="name" className="sm:text-right">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-1 sm:col-span-3"
                        required
                      />
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                    >
                      <Label htmlFor="description" className="sm:text-right">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="col-span-1 sm:col-span-3"
                        required
                      />
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                    >
                      <Label htmlFor="manager" className="sm:text-right">Manager</Label>
                      <select
                          id="manager"
                          className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={formData.managerId}
                          onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        >
                          <option value="">Select Manager</option>
                          {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {`${manager.first_name} ${manager.last_name}`} - {manager.email}
                            </option>
                          ))}
                      </select>   

                    </motion.div>
                  </div>
                  <DialogFooter className="sm:justify-end">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button type="submit" className="w-full sm:w-auto">Save Department</Button>
                    </motion.div>
                  </DialogFooter>
                </form>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Transfer Employee Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle>Transfer Employee</DialogTitle>
                  <DialogDescription>
                    Move an employee to a different department
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleTransfer}>
                  <div className="grid gap-4 py-4">
                    {/* Employee Selection */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                    >
                      <Label className="sm:text-right">
                        Employee <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={transferData.employeeId}
                        onChange={(e) => setTransferData({ ...transferData, employeeId: e.target.value })}
                        required
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {`${emp.first_name} ${emp.last_name}`} - {emp.email}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    {/* From Department */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                    >
                      <Label className="sm:text-right">
                        Current Department <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={transferData.fromDept}
                        onChange={(e) => setTransferData({ ...transferData, fromDept: e.target.value })}
                        required
                      >
                        <option value="">Select Current Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.employee_count} employees)
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    {/* To Department */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                    >
                      <Label className="sm:text-right">
                        New Department <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={transferData.toDept}
                        onChange={(e) => setTransferData({ ...transferData, toDept: e.target.value })}
                        required
                      >
                        <option value="">Select New Department</option>
                        {departments
                          .filter(dept => dept.id !== transferData.fromDept)
                          .map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.employee_count} employees)
                            </option>
                          ))}
                      </select>
                    </motion.div>
                  </div>

                  <DialogFooter className="sm:justify-end gap-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsTransferModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={!transferData.employeeId || !transferData.fromDept || !transferData.toDept}
                      >
                        Complete Transfer
                      </Button>
                    </motion.div>
                  </DialogFooter>
                </form>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
     
     </div>
);
}