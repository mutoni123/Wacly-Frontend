"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Search, PlusCircle, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LeaveType {
    id: number;
    name: string;
    days_allowed: number;
    carry_forward: boolean;
    description: string;
    requires_approval: boolean;
    status: 'Active' | 'Inactive';
    created_at?: string;
    updated_at?: string;
}

interface FormData {
    id?: number;
    name: string;
    daysAllowed: number;
    carryForward: boolean;
    description: string;
    requiresApproval: boolean;
    status: 'Active' | 'Inactive';
}

export default function LeaveTypesPage() {
    const { toast } = useToast();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState<FormData>({
        name: '',
        daysAllowed: 0,
        carryForward: false,
        description: '',
        requiresApproval: true,
        status: 'Active',
    });

    const itemsPerPage = 5;

    const fetchLeaveTypes = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    variant: "destructive",
                    title: "Authentication Error",
                    description: "No authentication token found. Please login again."
                });
                window.location.href = '/login';
                return;
            }

            const response = await fetch("http://localhost:5000/api/leave-types", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                setLeaveTypes(data.data);
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Success",
                    description: "Leave types fetched successfully"
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to fetch leave types'
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLeaveTypes();
    }, [fetchLeaveTypes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'carryForward' || name === 'requiresApproval'
                ? value === 'true'
                : name === 'daysAllowed'
                    ? parseInt(value) || 0
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            const method = formData.id ? 'PUT' : 'POST';
            const url = `http://localhost:5000/api/leave-types${formData.id ? `/${formData.id}` : ''}`;

            const payload = {
                name: formData.name.trim(),
                daysAllowed: formData.daysAllowed,
                carryForward: formData.carryForward,
                description: formData.description.trim(),
                requiresApproval: formData.requiresApproval,
                status: formData.status
            };

            if (!payload.name) throw new Error("Name is required");
            if (isNaN(payload.daysAllowed) || payload.daysAllowed < 0) {
                throw new Error("Days allowed must be a positive number");
            }
            if (!payload.description) throw new Error("Description is required");

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.message || 'Failed to save leave type');
            }

            toast({
                variant: "default",
                className: "bg-green-500 text-white",
                title: "Success",
                description: `Leave type ${formData.id ? 'updated' : 'created'} successfully`
            });

            setShowForm(false);
            await fetchLeaveTypes();

            setFormData({
                name: '',
                daysAllowed: 0,
                carryForward: false,
                description: '',
                requiresApproval: true,
                status: 'Active'
            });
        } catch (error) {
            console.error('Submit error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to submit leave type'
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleEdit = (type: LeaveType) => {
        setFormData({
            id: type.id,
            name: type.name,
            daysAllowed: type.days_allowed,
            carryForward: type.carry_forward,
            description: type.description,
            requiresApproval: type.requires_approval,
            status: type.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`http://localhost:5000/api/leave-types/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }

            toast({
                variant: "default",
                className: "bg-green-500 text-white",
                title: "Success",
                description: "Leave type deleted successfully"
            });
            
            await fetchLeaveTypes();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to delete leave type'
            });
        } finally {
            setIsLoading(false);
            setDeleteConfirmId(null);
        }
    };

    const filteredTypes = leaveTypes.filter(
        (type) => 
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTypes = filteredTypes.slice(startIndex, startIndex + itemsPerPage);

    const exportToCSV = () => {
        const headers = ['Name', 'Days Allowed', 'Carry Forward', 'Description', 'Requires Approval', 'Status'];
        const csvContent = [
            headers.join(','),
            ...leaveTypes.map((type) => [
                type.name,
                type.days_allowed,
                type.carry_forward ? 'Yes' : 'No',
                type.description,
                type.requires_approval ? 'Yes' : 'No',
                type.status,
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leave-types.csv';
        a.click();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Leave Types</h1>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={exportToCSV}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Dialog open={showForm} onOpenChange={setShowForm}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Add Leave Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{formData.id ? 'Edit Leave Type' : 'New Leave Type'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Enter leave type name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="daysAllowed" className="block text-sm font-medium text-gray-700 mb-2">
                                            Days Allowed
                                        </label>
                                        <Input
                                            type="number"
                                            id="daysAllowed"
                                            name="daysAllowed"
                                            placeholder="Enter days allowed"
                                            value={formData.daysAllowed}
                                            onChange={handleChange}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="carryForward" className="block text-sm font-medium text-gray-700 mb-2">
                                            Carry Forward
                                        </label>
                                        <select
                                            id="carryForward"
                                            name="carryForward"
                                            value={formData.carryForward.toString()}
                                            onChange={handleChange}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                            required
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="requiresApproval" className="block text-sm font-medium text-gray-700 mb-2">
                                            Requires Approval
                                        </label>
                                        <select
                                            id="requiresApproval"
                                            name="requiresApproval"
                                            value={formData.requiresApproval.toString()}
                                            onChange={handleChange}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                            required
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <Input
                                        id="description"
                                        name="description"
                                        placeholder="Enter description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2"
                                        required
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
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
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Submitting...' : 'Submit'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leave types..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Days Allowed</th>
                                <th className="px-4 py-3 text-left font-medium">Carry Forward</th>
                                <th className="px-4 py-3 text-left font-medium">Description</th>
                                <th className="px-4 py-3 text-left font-medium">Requires Approval</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{type.name}</td>
                                    <td className="px-4 py-3">{type.days_allowed}</td>
                                    <td className="px-4 py-3">{type.carry_forward ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3">{type.description}</td>
                                    <td className="px-4 py-3">{type.requires_approval ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            type.status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {type.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(type)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => setDeleteConfirmId(type.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTypes.length)} of{' '}
                    {filteredTypes.length} results
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog 
                open={!!deleteConfirmId} 
                onOpenChange={(open) => !open && setDeleteConfirmId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-4">
                        <p>Are you sure you want to delete this leave type?</p>
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}