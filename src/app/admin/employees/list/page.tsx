'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, MoreVertical, Edit, Trash } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';
import DepartmentSelect from '@/components/DepartmentSelect';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';


interface Employee {
  emp_id: string;
  name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
    password: '',
  });

  const fetchEmployees = useCallback(async (page = 1, role = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        role: role === 'all' ? '' : role,
        search: searchQuery,
      });

      const response = await fetch(`${API_BASE}/api/employees?${params}`);
      if (!response.ok) throw new Error('Failed to fetch employees');

      const data = await response.json();
      setEmployees(data.employees);
      setPagination(prev => ({ ...prev, total: data.total, page }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, searchQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEmployees(1, selectedRole);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedRole, fetchEmployees]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmployee
        ? `${API_BASE}/api/employees/${editingEmployee.emp_id}`
        : `${API_BASE}/api/employees`;

      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      toast.success(`Employee ${editingEmployee ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      fetchEmployees(pagination.page, selectedRole);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (empId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/employees/${empId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete employee');
      
      toast.success('Employee deleted successfully');
      fetchEmployees(pagination.page, selectedRole);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    const input = document.getElementById('employee-table');
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const date = new Date().toLocaleString();

    doc.addImage(imgData, 'PNG', 10, 30, 190, 0);
    doc.setFontSize(12);
    doc.text(`Generated on: ${date}`, 10, 20);
    doc.save('employees.pdf');
  };

  const exportToCSV = () => {
    const csvData = employees.map(employee => ({
      'Employee ID': employee.emp_id,
      Name: employee.name,
      Email: employee.email,
      Phone: employee.phone_number,
      Role: employee.role,
      Department: employee.department,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEmployees(1, selectedRole);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedRole]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        disabled={pagination.page === 1}
        onClick={() => fetchEmployees(pagination.page - 1, selectedRole)}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
      </span>
      <Button
        variant="outline"
        disabled={pagination.page * pagination.limit >= pagination.total}
        onClick={() => fetchEmployees(pagination.page + 1, selectedRole)}
      >
        Next
      </Button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage your organizations employees</p>
        </div>
        {/* Buttons container - fix indentation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={exportToPDF}>Export PDF</Button>
          <Button onClick={exportToCSV}>Export CSV</Button>
          <Button onClick={() => { 
            setIsModalOpen(true); 
            setEditingEmployee(null); 
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-md bg-white"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-md" id="employee-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-red-500 py-8">
                  {error}
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.emp_id}>
                  <TableCell className="font-medium">{employee.emp_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone_number}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        employee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {employee.role}
                    </span>
                  </TableCell>
                  <TableCell>{employee.department || 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingEmployee(employee);
                            setFormData({
                              name: employee.name,
                              email: employee.email,
                              phone_number: employee.phone_number,
                              role: employee.role,
                              department: employee.department,
                              password: '',
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(employee.emp_id)}
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
        <PaginationControls />
      </div>

      {/* Add/Edit Employee Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <select
                  id="role"
                  className="col-span-3 px-4 py-2 border rounded-md"
                  value={formData.role}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    role: e.target.value as 'admin' | 'manager' | 'employee' 
                  })}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <DepartmentSelect
                  value={formData.department}
                  onSelect={(value) => setFormData({ ...formData, department: value })}
                  className="col-span-3"
                />
              </div>

              {!editingEmployee && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingEmployee ? 'Update Employee' : 'Create Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}