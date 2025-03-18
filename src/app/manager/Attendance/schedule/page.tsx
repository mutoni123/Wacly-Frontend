"use client"

import { useState, useEffect, useCallback } from 'react';
import { useScheduleManagement, ShiftFormData } from '@/hooks/schedule-hook';
import { useEmployees } from '@/hooks/employee-hook';
import { CalendarView } from '@/components/manager/schedule/CalendarView';
import { ListView } from '@/components/manager/schedule/ListView';
import { WeekView } from '@/components/manager/schedule/WeekView';
import { CreateShiftModal } from '@/components/manager/schedule/CreateShiftModal';
import { AssignScheduleModal } from '@/components/manager/schedule/AssignScheduleModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import {
  CalendarDays,
  ListFilter,
  Plus,
  Users,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { addMonths, format, subMonths, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Schedule } from '@/types/schedule';

interface CalendarViewEvent {
  id: string;
  title: string;
  date: Date;
  shift: string;
  employees: { id: string; name: string; }[];
}

interface ModalScheduleData {
  shiftId: string;
  employeeIds: string[];
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly";
  recurringEndDate?: Date;
  recurringDays?: number[];
  recurringInterval?: number;
}

export default function SchedulePage() {
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createShiftOpen, setCreateShiftOpen] = useState(false);
  const [assignScheduleOpen, setAssignScheduleOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>();

  const {
    schedules,
    shifts,
    loading,
    pagination,
    fetchDepartmentSchedules: fetchSchedules,
    fetchDepartmentShifts: fetchShifts,
    createShift,
    assignSchedule
  } = useScheduleManagement();

  const {
    employees,
    fetchDepartmentEmployees: fetchEmployees
  } = useEmployees();

  const fetchData = useCallback(() => {
    fetchShifts();
    fetchEmployees();
  }, [fetchShifts, fetchEmployees]);

  const fetchScheduleData = useCallback(() => {
    fetchSchedules({
      dateRange: dateRange ? {
        from: dateRange.from as Date,
        to: dateRange.to as Date
      } : undefined,
      shiftId: selectedShift,
      search: searchQuery,
      limit: 10
    });
  }, [fetchSchedules, dateRange, selectedShift, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData, currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  // Remove unused date parameter
  const handleDateSelect = () => {
    setAssignScheduleOpen(true);
  };

  const handleEditSchedule = async (schedule: Schedule) => {
    console.log('Edit schedule:', schedule);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    console.log('Delete schedule:', scheduleId);
  };

  const handleCreateShift = async (values: ShiftFormData) => {
    try {
      await createShift(values);
      setCreateShiftOpen(false);
      fetchShifts();
    } catch (error) {
      console.error('Error creating shift:', error);
    }
  };
    // Update handleAssignSchedule to handle type conversion
    const handleAssignSchedule = async (values: ModalScheduleData) => {
      try {
        const scheduleData = {
          shift_id: values.shiftId,
          employee_ids: values.employeeIds,
          start_date: values.startDate,
          end_date: values.endDate,
          recurring_options: values.isRecurring ? {
            type: values.recurringType!,
            end_date: values.recurringEndDate!,
            days: values.recurringDays,
            interval: values.recurringInterval || 1
          } : undefined
        };
  
        await assignSchedule(scheduleData);
        setAssignScheduleOpen(false);
        fetchScheduleData();
      } catch (error) {
        console.error('Error assigning schedule:', error);
      }
    };
  
    const mapSchedulesToEvents = (schedules: Schedule[]): CalendarViewEvent[] => {
      return schedules.map(schedule => ({
        id: schedule.id,
        title: schedule.shift.name,
        date: new Date(schedule.start_date),
        shift: schedule.shift.name,
        employees: schedule.employees.map(emp => ({
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`
        }))
      }));
    };
  
    const renderNavigation = () => {
      if (view === 'month') {
        return (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        );
      } else if (view === 'week') {
        return (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              Week of {format(startOfWeek(currentDate), 'MMM d, yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      return null;
    };
  
    const renderContent = () => {
      if (loading) {
        return (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
      }
  
      switch (view) {
        case 'list':
          return (
            <ListView
              schedules={schedules}
              onEdit={handleEditSchedule}
              onDelete={handleDeleteSchedule}
              pagination={{
                currentPage: pagination.page,
                totalPages: pagination.totalPages,
                totalItems: pagination.items,
                itemsPerPage: 10
              }}
            />
          );
        case 'week':
          return (
            <WeekView
              currentDate={currentDate}
              events={mapSchedulesToEvents(schedules)}
              onDateSelect={handleDateSelect}
            />
          );
        default:
          return (
            <CalendarView
              currentDate={currentDate}
              events={mapSchedulesToEvents(schedules)}
              onDateSelect={handleDateSelect}
            />
          );
      }
    };
  
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">Department Schedule</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* View Toggle */}
            <Tabs defaultValue={view} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="month" onClick={() => setView('month')}>
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="week" onClick={() => setView('week')}>
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="list" onClick={() => setView('list')}>
                  <List className="h-5 w-5 mr-2" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {/* Actions */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => setCreateShiftOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Shift
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                onClick={() => setAssignScheduleOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Assign Schedule
              </Button>
            </div>
          </div>
        </div>
  
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <DateRangePicker
                selected={dateRange}
                onSelect={setDateRange}
                className="w-full sm:w-auto"
              />
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map(shift => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="icon" className="hidden sm:flex">
                <ListFilter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
  
        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {renderNavigation()}
              {renderContent()}
            </div>
          </CardContent>
        </Card>
  
        {/* Modals */}
        <CreateShiftModal
          open={createShiftOpen}
          onClose={() => setCreateShiftOpen(false)}
          onSubmit={handleCreateShift}
        />
        <AssignScheduleModal
          open={assignScheduleOpen}
          onClose={() => setAssignScheduleOpen(false)}
          onSubmit={handleAssignSchedule}
          shifts={shifts}
          employees={employees.map(emp => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`
          }))}
        />
      </div>
    );
  }