// types/schedule.ts

// Base interfaces
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  department_id?: string;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  description?: string;
  department_id?: string;
  status?: 'active' | 'inactive';
}

// Calendar and Display interfaces
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  shift: string;
  employees: {
    id: string;
    name: string;
  }[];
}

// API Data interfaces
export interface Schedule {
  id: string;
  shift_id: string;
  start_date: string;
  end_date: string;
  shift: {
    id: string;
    name: string;
  };
  employees: Employee[];
}

// Form Values interfaces
export interface ShiftFormData {
  name: string;
  start_time: string;
  end_time: string;
  description?: string;
}

export interface ScheduleAssignmentData {
  shift_id: string;
  employee_ids: string[];
  start_date: Date;
  end_date: Date;
  recurring_options?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_date: Date;
    days?: number[];
  };
}

// API Response interfaces
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface ScheduleFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  shiftId?: string;
  search?: string;
  limit?: number;
  page?: number;
}