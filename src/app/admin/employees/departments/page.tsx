'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Building, 
    Users, 
    UserPlus, 
    ChevronDown, 
    ChevronUp, 
    BarChart3, 
    FileDown, 
    FilePlus, 
    Search, 
    ArrowRightLeft, 
    Edit, 
    Trash, 
    Plus, 
    AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuGroup, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Select, 
    SelectContent, 
    SelectGroup, 
    SelectItem, 
    SelectLabel, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
    PieChart, 
    Pie, 
    BarChart, 
    Bar, 
    Cell, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

// Interfaces
interface User {
    id: string;           // Format: WACLY-EMP-XXX or WACLY-MNG-XXX
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    department_id: string | null;
    gender: string | null;
    dob: string | null;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  manager: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
  } | null;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

interface TransferData {
    employeeId: string;
    fromDept: string;
    toDept: string;
}

interface FormData {
    id: string;
    name: string;
    description: string;
}

// Constants
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export default function DepartmentPage() {
  const { toast } = useToast();

  // State Management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Form State
  const [formData, setFormData] = useState<FormData>({
      id: '',
      name: '',
      description: '',
  });

  const [transferData, setTransferData] = useState<TransferData>({
      employeeId: '',
      fromDept: '',
      toDept: '',
  });

    // Main Data Fetching Function
    const fetchDepartments = useCallback(async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              toast({
                  variant: "destructive",
                  title: "Authentication Error",
                  description: "Please login to continue",
              });
              window.location.href = '/login';
              return;
          }
  
          setLoading(true);
  
          // Fetch both departments and users
          const [departmentsResponse, usersResponse] = await Promise.all([
              fetch(`${API_BASE}/api/departments`, {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  }
              }),
              fetch(`${API_BASE}/api/users`, {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  }
              })
          ]);
  
          if (!departmentsResponse.ok || !usersResponse.ok) {
              throw new Error('Failed to fetch data');
          }
  
          const departmentsData = await departmentsResponse.json();
          const usersData = await usersResponse.json();
  
          // Set departments
          const departments = Array.isArray(departmentsData) ? departmentsData : [];
          setDepartments(departments);
  
          // Process users data - note that it's nested in a pagination structure
          const users = usersData.users || [];  // Extract users array from pagination structure
          const employeesList = users.filter((user: User) => 
              user.id?.startsWith('WACLY-EMP-') && 
              user.first_name && 
              user.last_name
          );
  
          setEmployees(employeesList);
          console.log('Processed Data:', { departments, employees: employeesList });
  
      } catch (err) {
          console.error('Error fetching data:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load data",
          });
      } finally {
          setLoading(false);
      }
  }, [toast]);

    // Initial Data Load
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
          window.location.href = '/login';
          return;
      }

      fetchDepartments().catch(error => {
          console.error('Error in initial data load:', error);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load initial data",
          });
      });
    }, [fetchDepartments, toast]);

    // Auto-populate department when employee is selected
    useEffect(() => {
      if (transferData.employeeId) {
          const employee = employees.find(emp => emp.id === transferData.employeeId);
          if (employee?.department_id) {
              setTransferData(prev => ({...prev, fromDept: employee.department_id
              }));
              
              console.log('Updated transfer data:', {
                  employeeId: transferData.employeeId,
                  fromDept: employee.department_id,
                  employee: employee
              });
          }
      }
    }, [transferData.employeeId, employees]);
    // Filter departments based on search
    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Prepare chart data
    const departmentChartData = departments.map((dept, index) => ({
        name: dept.name,
        value: dept.employee_count || 0,
        fill: COLORS[index % COLORS.length]
    }));
      // Handle Department Form Submission (Create/Update)
      const handleDepartmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    variant: "destructive",
                    title: "Authentication Error",
                    description: "Please login to continue"
                });
                window.location.href = '/login';
                return;
            }

            setLoading(true);
            const method = formData.id ? 'PUT' : 'POST';
            const url = formData.id 
                ? `${API_BASE}/departments/${formData.id}`
                : `${API_BASE}/departments`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save department');
            }

            toast({
                className: "bg-green-500 text-white",
                title: "Success",
                description: `Department ${formData.id ? 'updated' : 'created'} successfully`
            });

            setIsDeptModalOpen(false);
            setFormData({ id: '', name: '', description: '' });
            fetchDepartments();

        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : 'Failed to save department'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle Employee Transfer
    const handleTransfer = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              toast({
                  variant: "destructive",
                  title: "Authentication Error",
                  description: "Please login to continue"
              });
              window.location.href = '/login';
              return;
          }

          // Validate required fields
          if (!transferData.employeeId || !transferData.toDept) {
              toast({
                  variant: "destructive",
                  title: "Validation Error",
                  description: "Please select both employee and target department"
              });
              return;
          }

          // Validate employee ID format
          if (!transferData.employeeId.startsWith('WACLY-EMP-')) {
              toast({
                  variant: "destructive",
                  title: "Validation Error",
                  description: "Invalid employee ID format"
              });
              return;
          }

          setLoading(true);

          const response = await fetch(`${API_BASE}/api/departments/transfer`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  employeeId: transferData.employeeId,
                  toDept: transferData.toDept
              })
          });

          if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Transfer failed');
          }

          const result = await response.json();

          if (result.success) {
              const targetDeptName = departments.find(d => d.id === transferData.toDept)?.name;
              const employeeName = employees.find(e => e.id === transferData.employeeId);
              
              toast({
                  className: "bg-green-500 text-white",
                  title: "Success",
                  description: `Successfully transferred ${employeeName?.first_name} ${employeeName?.last_name} to ${targetDeptName}`
              });

              // Reset form and close modal
              setIsTransferModalOpen(false);
              setTransferData({
                  employeeId: '',
                  fromDept: '',
                  toDept: ''
              });

              // Refresh data
              await fetchDepartments();
          } else {
              throw new Error(result.message || 'Transfer failed');
          }

      } catch (err) {
          console.error('Transfer error:', err);
          toast({
              variant: "destructive",
              title: "Error",
              description: err instanceof Error ? err.message : 'Failed to transfer employee'
          });
      } finally {
          setLoading(false);
      }
    };

    // Handle Department Deletion
    const handleDeleteDepartment = async (departmentId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    variant: "destructive",
                    title: "Authentication Error",
                    description: "Please login to continue"
                });
                window.location.href = '/login';
                return;
            }

            setLoading(true);
            const response = await fetch(`${API_BASE}/api/departments/${departmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete department');
            }

            toast({
                className: "bg-green-500 text-white",
                title: "Success",
                description: "Department deleted successfully"
            });

            setIsDeleteDialogOpen(false);
            setDepartmentToDelete(null);
            fetchDepartments();

        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : 'Failed to delete department'
            });
        } finally {
            setLoading(false);
        }
    };

    // Export Functions
    const exportToPDF = async () => {
        try {
            const element = document.getElementById('department-list');
            if (!element) return;

            const canvas = await html2canvas(element);
            const pdf = new jsPDF();

            pdf.setFontSize(18);
            pdf.text('Department List', 105, 15, { align: 'center' });
            pdf.setFontSize(10);
            const date = new Date().toLocaleString();
            pdf.text(`Generated on: ${date}`, 10, 25);
            pdf.text(`Total Departments: ${departments.length}`, 10, 30);

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 35, 190, 0);
            pdf.save('departments.pdf');

            toast({
                className: "bg-green-500 text-white",
                title: "Success",
                description: "PDF exported successfully"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to export PDF"
            });
        }
    };

    const exportToCSV = () => {
        try {
            const csvData = departments.map(dept => ({
                'Department ID': dept.id,
                'Name': dept.name,
                'Description': dept.description,
                'Manager': dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : 'N/A',
                'Employee Count': dept.employee_count
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', 'departments.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                className: "bg-green-500 text-white",
                title: "Success",
                description: "CSV exported successfully"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to export CSV"
            });
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Management</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-gray-600">
                        Manage your organizations structure and departments
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <FileDown className="w-4 h-4" />
                                    Export
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={exportToPDF}>
                                        <FilePlus className="w-4 h-4 mr-2" />
                                        Export as PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToCSV}>
                                        <FileDown className="w-4 h-4 mr-2" />
                                        Export as CSV
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            onClick={() => {
                                setFormData({ id: '', name: '', description: '' });
                                setIsDeptModalOpen(true);
                            }}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Department
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                            placeholder="Search departments..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsTransferModalOpen(true)}
                        className="sm:self-end gap-2"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Transfer Employee
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Departments
                        </TabsTrigger>
                        <TabsTrigger value="employees" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Staffing
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* Department List Tab */}
                    <TabsContent value="list" className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="department-list">
                            {loading ? (
                                // Loading skeletons
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <Card key={`skeleton-${idx}`} className="shadow-sm">
                                        <CardHeader className="pb-2">
                                            <Skeleton className="h-6 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-20 w-full" />
                                        </CardContent>
                                        <CardFooter>
                                            <Skeleton className="h-8 w-full" />
                                        </CardFooter>
                                    </Card>
                                ))
                            ) : error ? (
                                // Error message
                                <Card className="col-span-full shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="text-center text-red-500">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                                            <p className="mb-2">{error}</p>
                                            <Button onClick={() => fetchDepartments()}>Try Again</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : filteredDepartments.length === 0 ? (
                                // No departments found
                                <Card className="col-span-full shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="text-center text-gray-500">
                                            <Building className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            <p className="mb-2">
                                                {searchQuery ? 'No departments match your search' : 'No departments found'}
                                            </p>
                                            {searchQuery && (
                                                <Button variant="outline" onClick={() => setSearchQuery('')}>
                                                    Clear Search
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                // Department cards
                                filteredDepartments.map((dept) => (
                                    <Card key={dept.id} className="shadow-sm overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl">{dept.name}</CardTitle>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setFormData({
                                                                    id: dept.id,
                                                                    name: dept.name,
                                                                    description: dept.description || '',
                                                                });
                                                                setIsDeptModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                setDepartmentToDelete(dept.id);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <CardDescription>
                                                {dept.description || 'No description provided'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Manager:</span>
                                                    <span className="font-medium">
                                                    {dept.manager ? (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                        {`${dept.manager.first_name[0]}${dept.manager.last_name[0]}`}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span>{`${dept.manager.first_name} ${dept.manager.last_name}`}</span>
                                                            </div>
                                                        ) : (
                                                            'Not assigned'
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Employees:</span>
                                                    <Badge variant="secondary">{dept.employee_count}</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-between"
                                                onClick={() => setExpandedDepartment(
                                                    expandedDepartment === dept.id ? null : dept.id
                                                )}
                                            >
                                                <span>View Details</span>
                                                {expandedDepartment === dept.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CardFooter>
                                        {expandedDepartment === dept.id && (
                                            <div className="px-6 pb-4 text-sm space-y-2 bg-gray-50">
                                                <div className="py-2">
                                                    <div className="mb-1 font-medium">Created:</div>
                                                    <div>{new Date(dept.created_at).toLocaleDateString()}</div>
                                                </div>
                                                {dept.updated_at && (
                                                    <div className="py-2 border-t border-gray-100">
                                                        <div className="mb-1 font-medium">Last Updated:</div>
                                                        <div>{new Date(dept.updated_at).toLocaleDateString()}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Staffing Tab */}
                    <TabsContent value="employees" className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                // Loading skeletons for staffing view
                                Array.from({ length: 2 }).map((_, idx) => (
                                    <Card key={`emp-skeleton-${idx}`} className="shadow-sm">
                                        <CardHeader>
                                            <Skeleton className="h-6 w-1/2 mb-2" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <Skeleton key={i} className="h-10 w-full" />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : filteredDepartments.length === 0 ? (
                                <Card className="col-span-full shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="text-center text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            <p>No departments to display staffing information</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                // Department staffing cards
                                filteredDepartments.map((dept) => (
                                    <Card key={`staff-${dept.id}`} className="shadow-sm">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center">
                                                <CardTitle>{dept.name}</CardTitle>
                                                <Badge variant="outline">{dept.employee_count} Staff</Badge>
                                            </div>
                                            <CardDescription>Department Staff Overview</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {dept.manager ? 
                                                                    `${dept.manager.first_name[0]}${dept.manager.last_name[0]}` 
                                                                    : 'NA'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {dept.manager ? 
                                                                    `${dept.manager.first_name} ${dept.manager.last_name}` 
                                                                    : 'No Manager Assigned'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {dept.manager?.email || ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge>Manager</Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-5 w-5 text-gray-400" />
                                                        <span className="text-sm">Team Members</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs"
                                                        onClick={() => {
                                                            setIsTransferModalOpen(true);
                                                            setTransferData(prev => ({
                                                                ...prev,
                                                                toDept: dept.id
                                                            }));
                                                        }}
                                                    >
                                                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                                                        Add Member
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Employee Distribution Chart */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Employee Distribution</CardTitle>
                                    <CardDescription>Department staffing breakdown</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {departments.length === 0 ? (
                                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                                            <p>No department data available</p>
                                        </div>
                                    ) : (
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={departmentChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        nameKey="name"
                                                        label={({name, percent}) => 
                                                            `${name} ${(percent * 100).toFixed(0)}%`
                                                        }
                                                    >
                                                        {departmentChartData.map((entry, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`}
                                                                fill={entry.fill}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        formatter={(value) => 
                                                            [`${value} employees`, 'Count']
                                                        }
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Department Size Comparison */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Department Size Comparison</CardTitle>
                                    <CardDescription>Employee count by department</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {departments.length === 0 ? (
                                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                                            <p>No department data available</p>
                                        </div>
                                    ) : (
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={departmentChartData}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 5
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip
                                                        formatter={(value) => 
                                                            [`${value} employees`, 'Count']
                                                        }
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="value" name="Employees">
                                                        {departmentChartData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.fill}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Department Modal */}
            <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {formData.id ? 'Edit Department' : 'Create New Department'}
                        </DialogTitle>
                        <DialogDescription>
                            {formData.id ? 'Update department information.' : 'Create a new department for your organization.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDepartmentSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })}
                                    className="col-span-3"
                                    required
                                    placeholder="e.g. Marketing, Engineering, etc."
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        description: e.target.value
                                    })}
                                    className="col-span-3"
                                    placeholder="Brief department description"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeptModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Saving...
                                    </span>
                                ) : (
                                    formData.id ? 'Update Department' : 'Create Department'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Transfer Employee Modal */}
            <Dialog 
                open={isTransferModalOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setTransferData({ employeeId: '', fromDept: '', toDept: '' });
                    }
                    setIsTransferModalOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Transfer Employee</DialogTitle>
                        <DialogDescription>
                            Move an employee to a different department
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleTransfer}>
                        <div className="grid gap-4 py-4">
                            {/* Employee Selection */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="employeeId" className="text-right">
                                    Employee <span className="text-red-500">*</span>
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        value={transferData.employeeId}
                                        onValueChange={(value) => {
                                            const selectedEmployee = employees.find(emp => emp.id === value);
                                            const currentDept = selectedEmployee?.department_id || '';
                                            
                                            setTransferData({
                                                employeeId: value,
                                                fromDept: currentDept,
                                                toDept: ''
                                            });
                                        }}
                                        required
                                    >
                                        <SelectTrigger id="employeeId" className="w-full">
                                            <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Employees</SelectLabel>
                                                {employees && employees.length > 0 ? (
                                                    employees.map((emp) => {
                                                        const deptName = departments.find(
                                                            d => d.id === emp.department_id
                                                        )?.name || 'Unassigned';
                                                        
                                                        return (
                                                            <SelectItem 
                                                                key={emp.id} 
                                                                value={emp.id}
                                                            >
                                                                {`${emp.first_name} ${emp.last_name} (${deptName})`}
                                                            </SelectItem>
                                                        );
                                                    })
                                                ) : (
                                                    <SelectItem value="no-employees" disabled>
                                                        No employees available
                                                    </SelectItem>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Current Department Display */}
                            {transferData.employeeId && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Current Department</Label>
                                    <div className="col-span-3">
                                        <div className="p-2 bg-muted rounded-md text-sm font-medium">
                                            {departments.find(d => d.id === transferData.fromDept)?.name || 'Unassigned'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Target Department Selection */}
                            {transferData.employeeId && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="toDept" className="text-right">
                                        To Department <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={transferData.toDept}
                                            onValueChange={(value) => setTransferData(prev => ({
                                                ...prev,
                                                toDept: value
                                            }))}
                                            required
                                        >
                                            <SelectTrigger id="toDept" className="w-full">
                                                <SelectValue placeholder="Select new department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Available Departments</SelectLabel>
                                                    {departments
                                                        .filter(dept => dept.id !== transferData.fromDept)
                                                        .map((dept) => (
                                                            <SelectItem
                                                                key={dept.id}
                                                                value={dept.id}
                                                            >
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsTransferModalOpen(false);
                                    setTransferData({ employeeId: '', fromDept: '', toDept: '' });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !transferData.employeeId || !transferData.toDept}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Processing...
                                    </span>
                                ) : (
                                    'Transfer Employee'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the department
                      and remove all associated data.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                      onClick={() => departmentToDelete && handleDeleteDepartment(departmentToDelete)}
                      className="bg-red-600 hover:bg-red-700"
                  >
                      {loading ? (
                          <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Deleting...
                          </span>
                      ) : (
                          'Delete Department'
                      )}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
  </div>
);
}