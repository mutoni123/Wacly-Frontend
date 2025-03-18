'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSubmit: (data: TaskFormData) => Promise<void>;
    departmentId: string | null;
}

interface DepartmentUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'employee' | 'manager' | 'admin';
}

interface TaskFormData {
    title: string;
    description: string;
    assigned_to: string;
    deadline: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    department_id?: string | null;
}

export function TaskFormModal({ 
    isOpen, 
    onClose, 
    task, 
    onSubmit, 
    departmentId 
}: TaskFormModalProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        assigned_to: '',
        deadline: '',
        status: 'pending',
        priority: 'medium'
    });
    const [departmentUsers, setDepartmentUsers] = useState<DepartmentUser[]>([]);
    const [loading, setLoading] = useState(false);

    const getAuthToken = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    };

    // Fetch department users
    useEffect(() => {
        const fetchDepartmentUsers = async () => {
            if (!departmentId) return;

            try {
                const token = getAuthToken();
                const response = await fetch(`${API_BASE}/api/departments/${departmentId}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        toast({
                            description: "You don't have permission to view department users",
                            variant: "destructive"
                        });
                        return;
                    }
                    throw new Error('Failed to fetch department users');
                }

                const { data, success } = await response.json();
                if (success) {
                    const employees = data.filter(
                        (user: DepartmentUser) => user.role === 'employee'
                    );
                    setDepartmentUsers(employees);
                }
            } catch (error) {
                console.error('Error fetching department users:', error);
                toast({
                    description: 'Failed to load department users',
                    variant: "destructive"
                });
            }
        };

        fetchDepartmentUsers();
    }, [departmentId]);

    // Reset form when modal opens/closes or task changes
    useEffect(() => {
        if (isOpen && task) {
            setFormData({
                title: task.title,
                description: task.description,
                assigned_to: task.assigned_to,
                deadline: task.deadline.split('T')[0], // Format date for input
                status: task.status,
                priority: task.priority
            });
        } else if (isOpen) {
            setFormData({
                title: '',
                description: '',
                assigned_to: '',
                deadline: '',
                status: 'pending',
                priority: 'medium'
            });
        }
    }, [isOpen, task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                department_id: departmentId
            });
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof TaskFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {task ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Assign To</label>
                        <Select
                            value={formData.assigned_to}
                            onValueChange={(value) => handleChange('assigned_to', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                                {departmentUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Deadline</label>
                        <Input
                            type="date"
                            required
                            value={formData.deadline}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <Select
                            value={formData.priority}
                            onValueChange={(value) => handleChange('priority', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}