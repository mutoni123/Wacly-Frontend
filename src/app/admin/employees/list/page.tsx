'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash,
  FileText,
  FileDown,
  Eye,
  Download,
  Loader2
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogDescription, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import DepartmentSelect from '@/components/DepartmentSelect';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import {  
  ExclamationCircleIcon, 
  FolderOpenIcon 
} from '@heroicons/react/24/outline';
import { cn } from "@/lib/utils";

// Interfaces
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'employee';
  department_id: string | null;
  gender: 'male' | 'female' | 'other' | null;
  dob: string | null;
  department?: {
    id: string;
    name: string;
    manager_id?: string;
  };
  last_login?: string;
}

interface Department {
  id: string;
  name: string;
  manager_id: string | null;
  description: string;
}

// Constants
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function EmployeeListPage() {
  const { toast } = useToast();

  // Main state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department_id: '',
    password: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    dob: ''
  });

  // Debounce hook for search
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Custom hook for debouncing
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

  // Fetch departments effect
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/api/departments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
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
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load departments",
        });
      }
    };

    fetchDepartments();
  }, [toast]);

  // Search and role filter effect
  useEffect(() => {
    if (typeof debouncedSearchQuery === 'string') {
      fetchEmployees(1, selectedRole);
    }
  }, [debouncedSearchQuery, selectedRole]);

  // Initial data load effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchEmployees(pagination.page, selectedRole);
  }, []);
   // Main Employees Fetching Function
    const fetchEmployees = useCallback(async (page = 1, role = 'all') => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          role: role === 'all' ? '' : role,
          search: searchQuery.trim(),
        });

        const response = await fetch(`${API_BASE}/api/users?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

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
        
        // Handle both array and paginated response formats
        const employeeData = Array.isArray(data) ? data : data.users || [];
        const total = Array.isArray(data) ? data.length : data.total || 0;
        
        setEmployees(employeeData);
        setPagination(prev => ({
          ...prev,
          total,
          page: Math.min(page, Math.ceil(total / prev.limit))
        }));

      } catch (err: unknown) {
        console.error('Fetch employees error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch employees');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load employees",
          variant: "destructive",
        });
        setEmployees([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          page: 1
        }));
      } finally {
        setLoading(false);
      }
    }, [pagination.limit, searchQuery, toast]);
  
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
    
      // Validate password for new employees
      if (!editingEmployee && (!formData.password || formData.password.length < 8)) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        });
        return;
      }
    
      // Validate manager role assignment
      if (formData.role === 'manager' && formData.department_id) {
        const targetDepartment = departments.find(d => d.id === formData.department_id);
        if (targetDepartment?.manager_id && targetDepartment.manager_id !== editingEmployee?.id) {
          toast({
            title: "Department Manager Error",
            description: "This department already has a manager assigned",
            variant: "destructive",
          });
          return;
        }
      }
    
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
    
        // Create base payload
        const basePayload = {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          department_id: formData.department_id || null,
        };
    
        // Add optional fields only if they have values
        const payload = {
          ...basePayload,
          ...(formData.phone && { phone: formData.phone.trim() }),
          ...(formData.gender && { gender: formData.gender.toLowerCase() }),
          ...(formData.dob && { dob: formData.dob }),
          ...(!editingEmployee || formData.password ? { password: formData.password } : {})
        };
    
        // Handle existing employee updates
        if (editingEmployee) {
          // Case 1: Manager being demoted to different role
          if (editingEmployee.role === 'manager' && formData.role !== 'manager') {
            // Clear manager_id from their current department
            if (editingEmployee.department_id) {
              await fetch(`${API_BASE}/api/departments/${editingEmployee.department_id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ manager_id: null })
              });
            }
          }
    
          // Case 2: Manager changing departments
          if (editingEmployee.role === 'manager' && formData.role === 'manager' && 
              editingEmployee.department_id !== formData.department_id) {
            
            // Clear old department's manager
            if (editingEmployee.department_id) {
              await fetch(`${API_BASE}/api/departments/${editingEmployee.department_id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ manager_id: null })
              });
            }
    
            // Handle previous manager of new department
            const targetDepartment = departments.find(d => d.id === formData.department_id);
            if (targetDepartment?.manager_id) {
              await fetch(`${API_BASE}/api/users/${targetDepartment.manager_id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  role: 'employee',
                  department_id: targetDepartment.id
                })
              });
            }
          }
    
          // Case 3: Employee being promoted to manager
          if (editingEmployee.role !== 'manager' && formData.role === 'manager') {
            const targetDepartment = departments.find(d => d.id === formData.department_id);
            if (targetDepartment?.manager_id) {
              // Demote existing manager to employee
              await fetch(`${API_BASE}/api/users/${targetDepartment.manager_id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  role: 'employee',
                  department_id: targetDepartment.id
                })
              });
            }
          }
    
          // Update the employee
          const response = await fetch(`${API_BASE}/api/users/${editingEmployee.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Operation failed');
          }
    
          // Update department manager if necessary
          if (formData.role === 'manager' && formData.department_id) {
            await fetch(`${API_BASE}/api/departments/${formData.department_id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                manager_id: editingEmployee.id
              })
            });
          }
        } else {
          // Creating new employee
          const response = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Operation failed');
          }
    
          const newEmployee = await response.json();
    
          // If creating new manager, update department
          if (formData.role === 'manager' && formData.department_id) {
            // Handle existing manager first
            const targetDepartment = departments.find(d => d.id === formData.department_id);
            if (targetDepartment?.manager_id) {
              await fetch(`${API_BASE}/api/users/${targetDepartment.manager_id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  role: 'employee',
                  department_id: targetDepartment.id
                })
              });
            }
    
            // Set new manager
            await fetch(`${API_BASE}/api/departments/${formData.department_id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                manager_id: newEmployee.id
              })
            });
          }
        }
    
        toast({
          title: "Success",
          description: `Employee ${editingEmployee ? 'updated' : 'created'} successfully`,
          variant: "default",
        });
    
        // Reset form and state
        setIsModalOpen(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role: 'employee',
          department_id: '',
          password: '',
          gender: '',
          dob: ''
        });
        setEditingEmployee(null);
    
        // Refresh employee list
        await fetchEmployees(pagination.page, selectedRole);
    
      } catch (err) {
        console.error('Submit error:', err);
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
      // Handle Employee Deletion
    const handleDelete = async (empId: string) => {
      if (!confirm('Are you sure you want to delete this employee?')) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const employeeToDelete = employees.find(emp => emp.id === empId);
        
        // Check if employee is a manager and handle department update
        if (employeeToDelete?.role === 'manager') {
          const managedDepartment = departments.find(d => d.manager_id === empId);
          if (managedDepartment) {
            await fetch(`${API_BASE}/api/departments/${managedDepartment.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                manager_id: null
              })
            });
          }
        }

        const response = await fetch(`${API_BASE}/api/users/${empId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete employee');
        }

        toast({
          title: "Success",
          description: "Employee deleted successfully",
          variant: "default",
        });

        fetchEmployees(pagination.page, selectedRole);

      } catch (err) {
        console.error('Delete error:', err);
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete employee",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Generate PDF Document
    const generatePDF = async () => {
      try {
        const input = document.getElementById('employee-table');
        if (!input) {
          throw new Error('Table element not found');
        }

        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();

        // Add title
        pdf.setFontSize(18);
        pdf.text('Employee List', 105, 15, { align: 'center' });

        // Add metadata
        pdf.setFontSize(10);
        const date = new Date().toLocaleString();
        pdf.text(`Generated on: ${date}`, 10, 25);
        pdf.text(`Total Employees: ${employees.length}`, 10, 30);

        // Add filters info if any
        if (selectedRole !== 'all' || searchQuery) {
          let filterText = 'Filters: ';
          if (selectedRole !== 'all') filterText += `Role: ${selectedRole} `;
          if (searchQuery) filterText += `Search: "${searchQuery}"`;
          pdf.text(filterText, 10, 35);
        }

        // Add table image
        pdf.addImage(imgData, 'PNG', 10, 40, 190, 0);

        return pdf;
      } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
      }
    };

    // Preview PDF in new tab
    const previewPDF = async () => {
      try {
        setIsExporting(true);
        const doc = await generatePDF();
        const pdfOutput = doc.output('bloburl');
        window.open(pdfOutput, '_blank');
        
        toast({
          title: "Success",
          description: "PDF preview generated successfully",
          variant: "default",
        });
      } catch (err: unknown) {
        console.error('PDF Preview Error:', err);
        
        toast({
          title: "Error",
          description: err instanceof Error 
            ? err.message 
            : "Failed to generate PDF preview",
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
      }
    };

    // Download PDF
    const downloadPDF = async () => {
      try {
        setIsExporting(true);
        const doc = await generatePDF();
        doc.save(`employees_${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast({
          title: "Success",
          description: "PDF downloaded successfully",
          variant: "default",
        });
      } catch (err: unknown) {
        console.error('PDF Download Error:', err);
        
        toast({
          title: "Error",
          description: err instanceof Error 
            ? err.message 
            : "Failed to download PDF",
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
      }
    };

    // Export to CSV
    const exportToCSV = () => {
      try {
        const csvData = employees.map(employee => ({
          'Employee ID': employee.id,
          'First Name': employee.first_name,
          'Last Name': employee.last_name,
          'Email': employee.email,
          'Phone': employee.phone || 'N/A',
          'Role': employee.role,
          'Department': employee.department?.name || 'N/A',
          'Gender': employee.gender || 'N/A',
          'Date of Birth': employee.dob || 'N/A',
          'Last Login': employee.last_login ? new Date(employee.last_login).toLocaleString() : 'Never'
        }));

        // Create CSV string
        const csv = Papa.unparse(csvData, {
          header: true,
          delimiter: ',',
          quotes: true
        });

        // Create blob and preview URL
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Create preview window with enhanced styling
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Employee Data Preview</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f4f4f4; }
                  tr:nth-child(even) { background-color: #f9f9f9; }
                  .download-btn {
                    background-color: #007bff;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                  }
                  .download-btn:hover { background-color: #0056b3; }
                </style>
              </head>
              <body>
                <h2>Employee Data Preview</h2>
                <button class="download-btn" onclick="downloadCSV()">Download CSV</button>
                <table>
                  <thead>
                    <tr>${Object.keys(csvData[0]).map(header => `<th>${header}</th>`).join('')}</tr>
                  </thead>
                  <tbody>
                    ${csvData.map(row => `
                      <tr>${Object.values(row).map(cell => `<td>${cell}</td>`).join('')}</tr>
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
            description: "Popup blocked. Please allow popups to preview CSV",
            variant: "destructive",
          });
        }

        // Cleanup
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

      } catch (error) {
        console.error('CSV export error:', error);
        toast({
          title: "Error",
          description: "Failed to export CSV",
          variant: "destructive",
        });
      }
    };
    // Search handler
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    };
  
    // Role filter handler
    const handleRoleChange = (role: string) => {
      setSelectedRole(role);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };
  
    // Clear filters
    const clearFilters = () => {
      setSearchQuery('');
      setSelectedRole('all');
      setPagination(prev => ({ ...prev, page: 1 }));
    };
  
    // Pagination component
    const PaginationControls = () => {
      const totalPages = Math.ceil(pagination.total / pagination.limit);
      
      return (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1 || loading}
              onClick={() => fetchEmployees(1, selectedRole)}
            >
              First
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1 || loading}
              onClick={() => fetchEmployees(pagination.page - 1, selectedRole)}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = pagination.page <= 3
                  ? i + 1
                  : pagination.page >= totalPages - 2
                    ? totalPages - 4 + i
                    : pagination.page - 2 + i;
                
                if (pageNum <= totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      className="w-8"
                      onClick={() => fetchEmployees(pageNum, selectedRole)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages || loading}
              onClick={() => fetchEmployees(pagination.page + 1, selectedRole)}
            >
              Next
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages || loading}
              onClick={() => fetchEmployees(totalPages, selectedRole)}
            >
              Last
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 border rounded-md text-sm"
              value={pagination.limit}
              onChange={(e) => {
                setPagination(prev => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1
                }));
                fetchEmployees(1, selectedRole);
              }}
            >
              {[10, 25, 50, 100].map(value => (
                <option key={value} value={value}>
                  {value} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    };
  
    // Active filters display
    const ActiveFilters = () => {
      if (!searchQuery && selectedRole === 'all') return null;
  
      return (
        <div className="flex flex-wrap gap-2 mt-4">
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
  
          {(searchQuery || selectedRole !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </Button>
          )}
        </div>
      );
    };
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your organizations employees
            </p>
          </div>
  
                {/* Export and Add Employee Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="w-full sm:w-auto flex-1 sm:flex-none"
                        disabled={isExporting || employees.length === 0}
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
                    disabled={employees.length === 0}
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
                        password: '',
                        gender: '',
                        dob: ''
                      });
                    }}
                    className="w-full sm:w-auto flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </div>
  
              {/* Search and Filter Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
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
        
                {/* Active Filters */}
                <ActiveFilters />
              </div>
              {/* Employee Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden" id="employee-table">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="w-[100px] font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">Department</TableHead>
                      <TableHead className="w-[100px] font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading state with skeletons
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
                      // Error state
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
                      // Empty state
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-sm">
                            <FolderOpenIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-500 font-medium">No employees found</p>
                            {(searchQuery || selectedRole !== 'all') && (
                              <p className="text-gray-400 mt-1">
                                Try adjusting your search or filters
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Data rows
                      employees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">{employee.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {`${employee.first_name} ${employee.last_name}`}
                                </p>
                                {employee.gender && (
                                  <p className="text-xs text-gray-500">
                                    {employee.gender}
                                  </p>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {employee.phone || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              {
                                'bg-purple-100 text-purple-800': employee.role === 'admin',
                                'bg-blue-100 text-blue-800': employee.role === 'manager',
                                'bg-gray-100 text-gray-800': employee.role === 'employee',
                              }
                            )}>
                              {employee.role}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {employee.department?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem
                                    onClick={() => {
                                      setEditingEmployee(employee);
                                      setFormData({
                                        ...formData,
                                        first_name: employee.first_name,
                                        last_name: employee.last_name,
                                        email: employee.email,
                                        phone: employee.phone || '',
                                        role: employee.role,
                                        department_id: employee.department_id || '',
                                        password: '',
                                        gender: employee.gender || '',
                                        dob: employee.dob || ''
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
              <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingEmployee 
                ? 'Update employee information.' 
                : 'Fill in the details to create a new employee.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid Layout for Side-by-Side Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full"
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full"
                  placeholder="Enter last name"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                  placeholder="email@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full"
                  placeholder="+1234567890"
                  pattern="^\+?\d{1,3}\d{6,14}$"
                  title="Phone number in E.164 format (e.g., +1234567890)"
                />
                <p className="text-sm text-gray-500">
                  (e.g., +1234567890)
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Gender
              </Label>
              <select
                id="gender"
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.gender}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  gender: e.target.value as 'male' | 'female' | 'other' | '' 
                })}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </Label>
                <select
                  id="role"
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value as 'admin' | 'manager' | 'employee';
                    if (newRole === 'manager' && formData.department_id) {
                      const targetDept = departments.find(d => d.id === formData.department_id);
                      if (targetDept?.manager_id && targetDept.manager_id !== editingEmployee?.id) {
                        toast({
                          title: "Warning",
                          description: "Selected department already has a manager",
                          variant: "destructive",
                        });
                        return;
                      }
                    }
                    setFormData({ ...formData, role: newRole });
                  }}
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </Label>
                <DepartmentSelect
                  value={formData.department_id}
                  onSelect={(value) => setFormData({ ...formData, department_id: value })}
                  className="w-full"
                />
              </div>

              {/* Password */}
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password {!editingEmployee && <span className="text-red-500">*</span>}
                </Label>
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
                <p className="text-sm text-gray-500">
                  {editingEmployee 
                    ? "Leave blank to keep current password" 
                    : "Password must be between 8 and 100 characters"}
                </p>
              </div>
            </div>

            {/* Form Footer */}
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