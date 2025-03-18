'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TaskFormModal } from '@/components/manager/team/TeamFormModal';
import { TasksLoadingState } from '@/components/manager/team/loadingstate';
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';



interface Department {
    id: string;
    name: string;
}

interface TaskFormData {
    title: string;
    description: string;
    assigned_to: string;
    deadline: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    department_id?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

const statusColors = {
    'pending': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
} as const;

const priorityColors = {
    'low': 'bg-gray-100 text-gray-600',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
} as const;
export default function TaskAssignmentPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const getDepartmentId = () => {
        if (!user?.department) return null;
        
        if (typeof user.department === 'object' && 'id' in user.department) {
            return (user.department as Department).id;
        }
        
        if (typeof user.department === 'string') {
            return user.department;
        }
        
        return null;
    };

    const departmentId = getDepartmentId();

    const getAuthToken = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    };

    // Fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setIsLoading(true);
                const token = getAuthToken();
                const response = await fetch(`${API_BASE}/api/tasks/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        window.location.href = '/login';
                        return;
                    }
                    throw new Error('Failed to fetch tasks');
                }

                const { data, success } = await response.json();
                if (success) {
                    setTasks(data);
                } else {
                    throw new Error('Failed to fetch tasks');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
                setError(errorMessage);
                toast({
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);
    const handleCreateTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            const { success, message } = await response.json();
            if (!success) {
                throw new Error(message || 'Failed to delete task');
            }

            setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
            toast({
                description: message || "Task has been successfully deleted"
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
            console.error('Error deleting task:', err);
            toast({
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleTaskSubmit = async (formData: TaskFormData) => {
        try {
            const token = getAuthToken();
            const url = selectedTask 
                ? `${API_BASE}/api/tasks/${selectedTask.id}`
                : `${API_BASE}/api/tasks/create`;

            const taskData: TaskFormData = {
                ...formData,
                department_id: departmentId || undefined
            };

            const response = await fetch(url, {
                method: selectedTask ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save task');
            }

            const { data, success, message } = await response.json();
            if (!success) {
                throw new Error(message || 'Failed to save task');
            }

            setTasks(currentTasks => {
                if (selectedTask) {
                    return currentTasks.map(task => 
                        task.id === selectedTask.id ? data : task
                    );
                }
                return [...currentTasks, data];
            });

            setIsModalOpen(false);
            toast({
                description: message || `Task ${selectedTask ? 'updated' : 'created'} successfully`
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save task';
            console.error('Error saving task:', err);
            toast({
                description: errorMessage,
                variant: "destructive",
            });
        }
    };
        // Filtering logic
        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                task.assignee?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                task.assignee?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    
        if (isLoading) return <TasksLoadingState />;
    
        if (error) return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Something went wrong
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Task Assignment</h1>
                    <Button onClick={handleCreateTask}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </div>
    
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search tasks..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
    
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="grid grid-cols-1 gap-4 p-4">
                                {filteredTasks.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No tasks found matching your criteria
                                    </div>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
                                        >
                                            <div className="space-y-2 md:flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{task.title}</h3>
                                                    <Badge className={priorityColors[task.priority]}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500">{task.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>
                                                        👤 {task.assignee?.first_name} {task.assignee?.last_name}
                                                    </span>
                                                    <span>
                                                        📅 Due: {format(new Date(task.deadline), 'PPP')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4 md:mt-0">
                                                <Badge className={statusColors[task.status]}>
                                                    {task.status.replace('_', ' ')}
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditTask(task)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
    
                <TaskFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                    onSubmit={handleTaskSubmit}
                    departmentId={departmentId}
                />
            </div>
        );
    }