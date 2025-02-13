  "use client";
  
  import React, { useEffect, useState } from "react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Search, Calendar } from "lucide-react";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { toast } from "react-hot-toast";
  
  interface LeaveRequest {
    id: number;
    employee: string;
    type: string;
    startDate: string;
    endDate: string;
    department: string;
    status: string;
  }
  
  interface Employee {
    id: String;
    name: string;
  }
  
  export default function LeaveRequestsPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
      employee_id: "",
      employee_name: "",
      leave_type: "",
      start_date: "",
      end_date: "",
      department: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    // Fetch leave requests
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/leave-requests");
        if (!response.ok) throw new Error("Failed to fetch leave requests");
        const data = await response.json();
        setLeaveRequests(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch leave requests");
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch employees
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/employees/names");
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch employees");
      }
    };
  
    useEffect(() => {
      fetchLeaveRequests();
      fetchEmployees();
    }, []);
  
    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };
  
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const response = await fetch("http://localhost:5000/api/leave-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        if (!response.ok) throw new Error("Failed to submit leave request");
  
        toast.success("Leave request submitted successfully");
        setIsModalOpen(false);
        fetchLeaveRequests(); // Refresh the list
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to submit leave request");
      }
    };
  
    // Handle approve/reject actions
    const handleAction = async (id: number, action: "approve" | "reject") => {
      try {
        const response = await fetch(`http://localhost:5000/api/leave-requests/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        });
  
        if (!response.ok) throw new Error(`Failed to ${action} leave request`);
  
        toast.success(`Leave request ${action}d successfully`);
        fetchLeaveRequests(); // Refresh the list
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to process request");
      }
    };
  
    return (
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              New Request
            </Button>
          </div>
  
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search requests..." className="pl-8" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
  
          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Employee</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Start Date</th>
                  <th className="px-4 py-3 text-left font-medium">End Date</th>
                  <th className="px-4 py-3 text-left font-medium">Department</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center">
                        Loading leave requests...
                      </td>
                    </tr>
                ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                ) : leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center">
                        No leave requests found.
                      </td>
                    </tr>
                ) : (
                    leaveRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{request.employee}</td>
                          <td className="px-4 py-3">{request.type}</td>
                          <td className="px-4 py-3">{new Date(request.startDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{new Date(request.endDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{request.department}</td>
                          <td className="px-4 py-3">
                        <span
                            className={`px-2 py-1 rounded-full text-xs ${
                                request.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : request.status === "Approved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                            }`}
                        >
                          {request.status}
                        </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleAction(request.id, "approve")}
                              >
                                Approve
                              </Button>
                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleAction(request.id, "reject")}
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
          </div>
  
          {/* Modal for New Leave Request */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Leave Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Select
                          value={formData.employee_id}
                          onValueChange={(value) => {
                            const selectedEmployee = employees.find(emp => emp.emp_id === value);
                            setFormData({
                              ...formData,
                              employee_id: value,
                              employee_name: selectedEmployee ? selectedEmployee.name : ""
                            });
                          }}
                          required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                              <SelectItem key={employee.emp_id} value={employee.emp_id}>
                                {employee.emp_id}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employee_name">Employee Name</Label>
                      <Input
                          id="employee_name"
                          value={formData.employee_name}
                          readOnly
                          className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="leave_type">Leave Type</Label>
                    <Select
                        value={formData.leave_type}
                        onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                        required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
    );
  }