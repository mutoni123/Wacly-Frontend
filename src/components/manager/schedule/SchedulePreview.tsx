// components/manager/schedule/SchedulePreview.tsx
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

interface SchedulePreviewProps {
    startDate: Date;
    endDate: Date;
    shiftName?: string;
    employeeCount: number;
    isRecurring: boolean;
    recurringType?: 'daily' | 'weekly' | 'monthly';
    recurringEndDate?: Date;
    recurringDays?: number[];
}

export function SchedulePreview({
    startDate,
    endDate,
    shiftName,
    employeeCount,
    isRecurring,
    recurringType,
    recurringEndDate,
    recurringDays,
}: SchedulePreviewProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Schedule Preview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shift</span>
                    <span className="font-medium">{shiftName || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Employees</span>
                    <Badge variant="secondary">{employeeCount} selected</Badge>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Range</span>
                    <span className="font-medium">
                        {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                    </span>
                </div>
                {isRecurring && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Recurring</span>
                            <Badge>{recurringType}</Badge>
                        </div>
                        {recurringEndDate && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Until</span>
                                <span className="font-medium">
                                    {format(recurringEndDate, 'MMM dd, yyyy')}
                                </span>
                            </div>
                        )}
                        {recurringType === 'weekly' && recurringDays && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Days</span>
                                <div className="flex gap-1">
                                    {recurringDays.map((day) => (
                                        <Badge key={day} variant="outline" className="text-xs">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][day]}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}