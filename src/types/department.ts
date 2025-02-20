// types/department.ts
export interface Department {
  id: string
  name: string
  description: string
  managerId: string
  managerName: string
  managerImage: string
  employeeCount: number
  budget: number
  status: 'active' | 'inactive'
  location: string
  createdAt: Date
  updatedAt: Date
}


export interface DepartmentFormData {
    name: string
    description: string
    managerId: string
    budget: number
    location: string
    status: 'active' | 'inactive'
  }

  export interface DepartmentTableFilters {
    search: string;
    status: string;
    location: string;
  }

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    departmentId: string;
    department?: string;
}

export interface Manager {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }

export interface TransferRequest {
    employeeId: string;
    fromDepartmentId: string;
    toDepartmentId: string;
    reason: string;
}