"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar } from 'lucide-react';

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  department: string;
  status: string;
}

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    department: ''
  });

  async function fetchLeaveRequests() {
    try {
      const response = await fetch('/api/leave-requests');
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  }

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowForm(false);
        fetchLeaveRequests(); // Refresh the leave requests list
      } else {
        console.error('Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
          <Button className="flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
            <Calendar className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {showForm && (
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">New Leave Request</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="employee_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Name
                    </label>
                    <Input
                        id="employee_name"
                        name="employee_name"
                        placeholder="Enter employee name"
                        value={formData.employee_name}
                        onChange={handleChange}
                        className="w-full"
                        required
                    />
                  </div>
                  <div>
                    <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type
                    </label>
                    <Select
                        value={formData.leave_type}
                        onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                        required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <Input
                        type="date"
                        id="start_date"
                        name="start_date"
                        placeholder="Select start date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full"
                        required
                    />
                  </div>
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <Input
                        type="date"
                        id="end_date"
                        name="end_date"
                        placeholder="Select end date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="w-full"
                        required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input
                      id="department"
                      name="department"
                      placeholder="Enter department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full"
                      required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>
        )}

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
              {leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{request.employee}</td>
                    <td className="px-4 py-3">{request.type}</td>
                    <td className="px-4 py-3">{new Date(request.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(request.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{request.department}</td>
                    <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}