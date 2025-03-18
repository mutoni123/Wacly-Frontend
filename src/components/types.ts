export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
  managerName: string;
  employeeCount: number;
  budget: number;
  activeProjects: number;
}

export interface DepartmentAnalytics {
  totalEmployees: number;
  averagePerformance: number;
  totalBudget: number;
  activeProjects: number;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
