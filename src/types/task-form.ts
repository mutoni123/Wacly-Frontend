// types/task-form.ts
import { Task } from './task';

export type TaskFormData = Pick<Task, 
    'title' | 
    'description' | 
    'assigned_to' | 
    'deadline' | 
    'status' | 
    'priority'
> & {
    department_id?: string;
};