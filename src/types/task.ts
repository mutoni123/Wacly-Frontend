// types/task.ts
export interface Task {
    id: string;
    title: string;
    description: string;
    assigned_to: string;
    department_id: string;
    deadline: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_by: string;
    created_at: string;
    updated_at: string;
    assignee?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    creator?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    department?: {
        id: string;
        name: string;
    };
}