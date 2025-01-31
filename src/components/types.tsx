export interface Employee {
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'On Leave' | 'Terminated';
  }
  
  export interface DashboardStats {
    totalEmployees: number;
    activeProjects: number;
    pendingRequests: number;
  }