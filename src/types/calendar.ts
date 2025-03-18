// types/calendar.ts
export interface LeaveRequest {
    id: number;
    user_id: string;
    user_name: string;
    department_id: string;
    leave_type: 'Annual' | 'Sick' | 'Personal' | 'Other';
    start_date: string;
    end_date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DayInfo {
    date: Date;
    leaves: LeaveRequest[];
    isWeekend: boolean;
    isToday: boolean;
    isHoliday?: boolean;
    holidayName?: string;
}