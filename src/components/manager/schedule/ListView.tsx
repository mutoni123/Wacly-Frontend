// components/manager/schedule/ListView.tsx
"use client"
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Schedule } from '@/types/schedule';

interface ListViewProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export function ListView({ schedules, onEdit, onDelete, pagination }: ListViewProps) {
  const getStatusBadge = (schedule: Schedule) => {
    const now = new Date();
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);

    if (now < startDate) {
      return <Badge variant="secondary">Pending</Badge>;
    } else if (now > endDate) {
      return <Badge variant="outline">Completed</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shift Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">
                {schedule.shift.name}
              </TableCell>
              <TableCell>
                {format(new Date(schedule.start_date), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                {format(new Date(schedule.end_date), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {schedule.employees.slice(0, 2).map((employee) => (
                    <Badge 
                      key={employee.id} 
                      variant="secondary" 
                      className="mr-1"
                    >
                      {`${employee.first_name} ${employee.last_name}`}
                    </Badge>
                  ))}
                  {schedule.employees.length > 2 && (
                    <Badge variant="outline">
                      +{schedule.employees.length - 2} more
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(schedule)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(schedule)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => onDelete(schedule.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {pagination && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </div>
          {/* Add pagination controls here if needed */}
        </div>
      )}
    </div>
  );
}