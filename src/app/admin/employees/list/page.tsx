'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, MoreVertical, Edit, Trash } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import DepartmentSelect from '@/components/DepartmentSelect';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import {  FileText, FileDown, Eye, Download, Loader2 } from 'lucide-react';
import { UserCircleIcon, ExclamationCircleIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { cn } from "@/lib/utils";


interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'employee';
  department_id?: string;
  department?: {
    id: string;
    name: string;
  };
  last_login?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function EmployeeListPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '',
    email: '', phone: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department_id: '',  password: '',
  });


  const fetchEmployees = useCallback(async (page = 1, role = 'all') => {
    try {
      setLoading(true);
      setError(null);
  
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        role: role === 'all' ? '' : role,
        search: searchQuery.trim(), // Trim whitespace from search
      });
  
      // Fetch with auth headers
      const response = await fetch(`${API_BASE}/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
  
      // Handle unauthorized access
      if (response.status === 401) {
        localStorage.removeItem('token');
        toast({
          title: "Session Expired",
          description: "Please login again to continue",
          variant: "destructive",
        });
        window.location.href = '/login';
        return;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch employees');
      }
  
      const data = await response.json();
  
      // Handle empty response
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setEmployees([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          page: 1
        }));
        return;
      }
  
      // Update employees state with proper type checking
      const employeeData = Array.isArray(data) ? data : data.users || [];
      setEmployees(employeeData);
  
      // Update pagination with proper fallbacks
      setPagination(prev => ({
        ...prev,
        total: Array.isArray(data) ? data.length : data.total || 0,
        page,
        // Ensure we don't exceed total pages
        page: Math.min(page, Math.ceil((Array.isArray(data) ? data.length : data.total || 0) / prev.limit))
      }));
  
      // Clear any existing errors
      setError(null);
  
    } catch (err) {
      console.error('Fetch employees error:', err);
      
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      
      // Show appropriate error message
      toast({
        title: "Error",
        description: err instanceof Error 
          ? err.message 
          : "Failed to fetch employees. Please try again.",
        variant: "destructive",
      });
  
      // Clear employees on error
      setEmployees([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        page: 1
      }));
  
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, searchQuery]);
  
  
  // Effect for fetching employees
  useEffect(() => {
    // Only fetch if we have a valid search query (null, empty, or actual query)
    if (typeof debouncedSearchQuery === 'string') {
      fetchEmployees(1, selectedRole);
    }
  }, [debouncedSearchQuery, selectedRole, fetchEmployees]);
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
  
    // Validate password for new employees or if password is provided
    if (!editingEmployee || formData.password) {
      if (!editingEmployee && (!formData.password || formData.password.length < 8)) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        });
        return;
      }
  
      if (formData.password && formData.password.length > 100) {
        toast({
          title: "Invalid Password",
          description: "Password cannot exceed 100 characters",
          variant: "destructive",
        });
        return;
      }
    }
  
    try {
      setLoading(true);
  
      // Prepare request URL
      const url = editingEmployee 
        ? `${API_BASE}/api/users/${editingEmployee.id}`
        : `${API_BASE}/api/users`;
  
      // Prepare request payload
      let payload = {
        ...formData,
        department_id: formData.department_id || null,
      };
  
      // Handle password in payload
      if (!editingEmployee || (formData.password && formData.password.trim() !== '')) {
        payload.password = formData.password;
      } else if (editingEmployee) {
        delete payload.password;
      }
  
      const response = await fetch(url, {
        method: editingEmployee ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
  
      // Handle unauthorized access
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
  
      const data = await response.json();
  
      // Show success message
      toast({
        title: "Success",
        description: `${formData.first_name} ${formData.last_name} has been ${editingEmployee ? 'updated' : 'created'} successfully`,
        variant: "default",
      });
  
      // Reset form state
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'employee',
        department_id: '',
        password: '',
      });
      setEditingEmployee(null);
  
      // Refresh employee list
      await fetchEmployees(pagination.page, selectedRole);
  
    } catch (err) {
      console.error('Submit error:', err);
  
      // Handle specific error cases
      if (err instanceof Error) {
        switch (true) {
          case /duplicate|already exists/i.test(err.message):
            toast({
              title: "Email Error",
              description: "This email address is already registered",
              variant: "destructive",
            });
            break;
  
          case /validation.*password/i.test(err.message):
            toast({
              title: "Password Error",
              description: "Password must be between 8 and 100 characters",
              variant: "destructive",
            });
            break;
  
          case /department|foreign key/i.test(err.message):
            toast({
              title: "Department Error",
              description: "Please select a valid department",
              variant: "destructive",
            });
            break;
  
          case /validation/i.test(err.message):
            toast({
              title: "Validation Error",
              description: "Please check all fields and try again",
              variant: "destructive",
            });
            break;
  
          default:
            toast({
              title: "Error",
              description: err.message || "An unexpected error occurred",
              variant: "destructive",
            });
        }
      } else {
        toast({
          title: "System Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/users/${empId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) throw new Error('Failed to delete employee');
      toast({
        title: "Success",
        description: "Employee deleted successfully",
        variant: "default",
      });
      fetchEmployees(pagination.page, selectedRole);
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
  });
    }
  };

  // Function to generate the PDF document
  const generatePDF = async () => {
  try {
    const input = document.getElementById('employee-table');
    if (!input) {
      throw new Error('Table element not found');
    }

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Employee List', 105, 15, { align: 'center' });
     // Add metadata
     doc.setFontSize(10);
     const date = new Date().toLocaleString();
     doc.text(`Generated on: ${date}`, 10, 25);
     doc.text(`Total Employees: ${employees.length}`, 10, 30);
 
     // Add table image
     doc.addImage(imgData, 'PNG', 10, 35, 190, 0);
 
     return doc;
   } catch (error) {
     console.error('PDF generation error:', error);
     throw error;
   }
   
  };

    // Function to preview PDF in new tab
  const previewPDF = async () => {
      try {
        setIsExporting(true);
        const doc = await generatePDF();
        const pdfOutput = doc.output('bloburl');
        window.open(pdfOutput, '_blank');
        toast({
          title: "Success",
          description: "PDF generated successfully",
          variant: "default",
        });
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate pdf",
          variant: "destructive",
    });
        console.error('PDF preview error:', error);
      } finally {
        setIsExporting(false);
      }
  };
    
    // Function to download PDF
  const downloadPDF = async () => {
      try {
        setIsExporting(true);
        const doc = await generatePDF();
        doc.save(`employees_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Success",
          description: "PDF downoaded successfully",
          variant: "default",
        });
        
      } catch (error) {
        toast({
          title: "Error",
          description: "dailed to download pdf",
          variant: "destructive",
    });
        console.error('PDF download error:', error);
      } finally {
        setIsExporting(false);
      }
  };


  const exportToCSV = () => {
    // Format the data according to the updated Employee interface
    const csvData = employees.map(employee => ({
      'Employee ID': employee.id,
      'First Name': employee.first_name,
      'Last Name': employee.last_name,
      Email: employee.email,
      Phone: employee.phone || 'N/A',
      Role: employee.role,
      Department: employee.department?.name || 'N/A',
      'Last Login': employee.last_login 
        ? new Date(employee.last_login).toLocaleString()
        : 'Never'
    }));
  
    // Create CSV string
    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ',',
      quotes: true // Ensure strings are quoted
    });
  
    // Create blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    // Create preview in new tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Employee Data Preview</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f4f4f4;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .download-btn {
                background-color: #007bff;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
              }
              .download-btn:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <h2>Employee Data Preview</h2>
            <button class="download-btn" onclick="downloadCSV()">Download CSV</button>
            <table>
              <thead>
                <tr>
                  ${Object.keys(csvData[0]).map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${csvData.map(row => `
                  <tr>
                    ${Object.values(row).map(cell => `<td>${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              function downloadCSV() {
                const link = document.createElement('a');
                link.href = '${url}';
                link.download = 'employees_${new Date().toISOString().split('T')[0]}.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            </script>
          </body>
        </html>
      `);
      previewWindow.document.close();
    } else {
      toast({
        title: "Error",
        description: "popup blocked, please allow popups to download CSV",
        variant: "destructive",
  });
    }
  
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEmployees(1, selectedRole);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedRole]);


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

  // Search handler function
const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchQuery(e.target.value);
  setPagination(prev => ({ ...prev, page: 1 }));
};

// Role handler function
const handleRoleChange = (role: string) => {
  setSelectedRole(role);
  setPagination(prev => ({ ...prev, page: 1 }));
};

// Add this custom hook for debouncing
function useDebounce<T>(value: T, delay: number): [T] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return [debouncedValue];
}

// Update your useEffect to use the debounced search query
useEffect(() => {
  fetchEmployees(pagination.page, selectedRole);
}, [debouncedSearchQuery, selectedRole, pagination.page]);

  

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage your organizations employees</p>
        </div>
        {/* Buttons container */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="w-full sm:w-auto flex-1 sm:flex-none"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={previewPDF}>
                <Eye className="w-4 h-4 mr-2" />
                Preview PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>


          <Button 
            onClick={exportToCSV} 
            className="w-full sm:w-auto flex-1 sm:flex-none"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button 
            onClick={() => {
              setIsModalOpen(true);
              setEditingEmployee(null);
              setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                role: 'employee',
                department_id: '',
                password: ''
              });
            }}
            className="w-full sm:w-auto flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearch}
              type="search"
              aria-label="Search employees"
            />
          </div>

          {/* Role Filter */}
          <select
            className="px-4 py-2 border rounded-md bg-white min-w-[150px]"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* Optional: Show active filters */}
        {(searchQuery || selectedRole !== 'all') && (
          <div className="mt-2 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:text-red-500"
                  aria-label="Clear search"
                >
                  ×
                </button>
              </span>
            )}
            {selectedRole !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                Role: {selectedRole}
                <button
                  onClick={() => handleRoleChange('all')}
                  className="ml-2 hover:text-red-500"
                  aria-label="Clear role filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Employee Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden" id="employee-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading state with better skeleton layout
                [...Array(5)].map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    {[...Array(7)].map((_, cellIndex) => (
                      <TableCell key={`loading-cell-${cellIndex}`}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                // Error state with better styling
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-sm">
                      <ExclamationCircleIcon className="h-8 w-8 text-red-500 mb-2" />
                      <p className="text-red-500 font-medium">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchEmployees(pagination.page, selectedRole)}
                        className="mt-2"
                      >
                        Try Again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                // Empty state with better styling
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-sm">
                      <FolderOpenIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 font-medium">No employees found</p>
                      {searchQuery && (
                        <p className="text-gray-400 mt-1">
                          Try adjusting your search or filters
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows with improved styling
                employees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {`${employee.first_name} ${employee.last_name}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {employee.phone || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          {
                            'bg-purple-100 text-purple-800': employee.role === 'admin',
                            'bg-blue-100 text-blue-800': employee.role === 'manager',
                            'bg-gray-100 text-gray-800': employee.role === 'employee'
                          }
                        )}
                      >
                        {employee.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {employee.department?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingEmployee(employee);
                              setFormData({
                                first_name: employee.first_name,
                                last_name: employee.last_name,
                                email: employee.email,
                                phone: employee.phone || '',
                                role: employee.role,
                                department_id: employee.department?.id || '',
                                password: '',
                              });
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Employee
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Employee
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {!loading && !error && employees.length > 0 && (
            <div className="p-4 border-t">
              <PaginationControls />
            </div>
          )}
        </div>

      {/* Add/Edit Employee Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee 
                  ? 'Update employee information.' 
                  : 'Fill in the details to create a new employee.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                {/* First Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="first_name" className="text-right">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last_name" className="text-right">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-3"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full"
                      placeholder="+1234567890"
                      pattern="^\+\d{1,3}\d{6,14}$"
                      title="Phone number in E.164 format (e.g., +1234567890)"
                    />
                    <p className="text-sm text-muted-foreground">
                       (e.g., +1234567890)
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="role"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'employee' })}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Department */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <DepartmentSelect
                    value={formData.department_id}
                    onSelect={(value) => setFormData({ ...formData, department_id: value })}
                    className="col-span-3"
                  />
                </div>

                {/* Password - Only show for new employees or optional for editing */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password {!editingEmployee && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full"
                      required={!editingEmployee}
                      minLength={8}
                      maxLength={100}
                      placeholder={editingEmployee ? "Leave blank to keep current" : "Enter password"}
                    />
                    <p className="text-sm text-muted-foreground">
                      {editingEmployee 
                        ? "Leave blank to keep current password" 
                        : "Password must be between 8 and 100 characters"}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingEmployee ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingEmployee ? 'Update Employee' : 'Create Employee'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

    </div>
  );
}