// components/manager/schedule/AssignScheduleModal.tsx
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SchedulePreview } from './SchedulePreview';


const assignmentFormSchema = z.object({
    shiftId: z.string().min(1, 'Please select a shift'),
    employeeIds: z.array(z.string()).min(1, 'Please select at least one employee'),
    startDate: z.date(),
    endDate: z.date(),
    isRecurring: z.boolean().default(false),
    recurringType: z.enum(['daily', 'weekly', 'monthly']).optional(),
    recurringEndDate: z.date().optional(),
    recurringDays: z.array(z.number()).optional(),
    recurringInterval: z.number().min(1).optional(),
}).refine((data) => {
    if (isBefore(data.endDate, data.startDate)) {
        return false;
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
}).refine((data) => {
    if (data.isRecurring && !data.recurringType) {
        return false;
    }
    return true;
}, {
    message: "Please select a recurring type",
    path: ["recurringType"],
}).refine((data) => {
    if (data.isRecurring && !data.recurringEndDate) {
        return false;
    }
    return true;
}, {
    message: "Please select an end date for recurring schedule",
    path: ["recurringEndDate"],
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignScheduleModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: AssignmentFormValues) => Promise<void>;
    shifts: Array<{ id: string; name: string }>;
    employees: Array<{ id: string; name: string }>;
}

const weekDays = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
] as const;

export function AssignScheduleModal({
    open,
    onClose,
    onSubmit,
    shifts,
    employees,
}: AssignScheduleModalProps) {
    const [loading, setLoading] = useState(false);
    const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [error, setError] = useState<string | null>(null);

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: {
            shiftId: '',
            employeeIds: [],
            startDate: new Date(),
            endDate: addDays(new Date(), 1),
            isRecurring: false,
            recurringDays: [],
            recurringInterval: 1,
        },
    });

    const isRecurring = form.watch('isRecurring');
    const recurringType = form.watch('recurringType');
    const selectedEmployeeIds = form.watch('employeeIds');
    const selectedShift = shifts.find(shift => shift.id === form.watch('shiftId'));
    const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));

    const handleSubmit = async (values: AssignmentFormValues) => {
        try {
            setError(null);
            setLoading(true);
            await onSubmit(values);
            form.reset();
            onClose();
        } catch (error) {
            setError('Failed to assign schedule. Please try again.');
            console.error('Error assigning schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[920px] h-[calc(100vh-40px)] p-0 gap-0">
            <div className="flex h-full">
                {/* Left Sidebar */}
                <div className="w-64 border-r h-full flex flex-col hidden md:block">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-lg">Schedule Assignment</h3>
                    </div>
                    <ScrollArea className="h-[calc(100vh-180px)]">
                        <div className="p-4 space-y-6">
                            <nav className="space-y-2">
                                <Button
                                    variant={activeTab === "basic" ? "default" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setActiveTab("basic")}
                                >
                                    Basic Information
                                </Button>
                                <Button
                                    variant={activeTab === "employees" ? "default" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setActiveTab("employees")}
                                >
                                    Select Employees
                                </Button>
                                <Button
                                    variant={activeTab === "recurring" ? "default" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setActiveTab("recurring")}
                                >
                                    Recurring Options
                                </Button>
                            </nav>
                            <SchedulePreview
                                startDate={form.watch('startDate')}
                                endDate={form.watch('endDate')}
                                shiftName={selectedShift?.name}
                                employeeCount={selectedEmployees.length}
                                isRecurring={isRecurring}
                                recurringType={recurringType}
                                recurringEndDate={form.watch('recurringEndDate')}
                                recurringDays={form.watch('recurringDays')}
                            />
                        </div>
                    </ScrollArea>
                </div>
    
                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full min-h-0">
                    {/* Fixed Header */}
                    <div className="shrink-0">
                        <DialogHeader className="px-4 py-3 border-b">
                            <DialogTitle>Assign Schedule</DialogTitle>
                        </DialogHeader>
    
                        {/* Mobile Tabs */}
                        <div className="md:hidden px-4 pt-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="basic">Basic</TabsTrigger>
                                    <TabsTrigger value="employees">Employees</TabsTrigger>
                                    <TabsTrigger value="recurring">Recurring</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
    
                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
                        <div className="p-6">
                            {error && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                        {/* Basic Tab */}
                                        <div className={cn(
                                            "space-y-6",
                                            activeTab === "basic" ? "block" : "hidden"
                                        )}>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Basic Information</CardTitle>
                                                    <CardDescription>
                                                        Select shift and schedule dates
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="shiftId"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Select Shift</FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a shift" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {shifts.map((shift) => (
                                                                            <SelectItem
                                                                                key={shift.id}
                                                                                value={shift.id}
                                                                            >
                                                                                {shift.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        {/* Start Date */}
                                                        <FormField
                                                            control={form.control}
                                                            name="startDate"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-col">
                                                                    <FormLabel>Start Date</FormLabel>
                                                                    <Card className="w-fit">
                                                                        <CardContent className="p-0">
                                                                            <Calendar
                                                                                mode="single"
                                                                                selected={field.value}
                                                                                onSelect={field.onChange}
                                                                                initialFocus
                                                                            />
                                                                        </CardContent>
                                                                    </Card>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {/* End Date */}
                                                        <FormField
                                                            control={form.control}
                                                            name="endDate"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-col">
                                                                    <FormLabel>End Date</FormLabel>
                                                                    <Card className="w-fit">
                                                                        <CardContent className="p-0">
                                                                            <Calendar
                                                                                mode="single"
                                                                                selected={field.value}
                                                                                onSelect={field.onChange}
                                                                                initialFocus
                                                                                disabled={(date) =>
                                                                                    isBefore(date, form.getValues('startDate'))
                                                                                }
                                                                            />
                                                                        </CardContent>
                                                                    </Card>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Employees Tab */}
                                        <div className={cn(
                                            "space-y-6",
                                            activeTab === "employees" ? "block" : "hidden"
                                        )}>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Select Employees</CardTitle>
                                                    <CardDescription>
                                                        Choose employees for this schedule
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="employeeIds"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-4">
                                                                <FormLabel>Select Employees</FormLabel>
                                                                <Popover
                                                                    open={employeeSearchOpen}
                                                                    onOpenChange={setEmployeeSearchOpen}
                                                                >
                                                                    <PopoverTrigger asChild>
                                                                        <FormControl>
                                                                            <Button
                                                                                variant="outline"
                                                                                role="combobox"
                                                                                className={cn(
                                                                                    "w-full justify-between",
                                                                                    !field.value && "text-muted-foreground"
                                                                                )}
                                                                            >
                                                                                {selectedEmployees.length > 0
                                                                                    ? `${selectedEmployees.length} employees selected`
                                                                                    : "Select employees"}
                                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-full p-0" align="start">
                                                                        <Command>
                                                                            <CommandInput placeholder="Search employees..." />
                                                                            <CommandEmpty>No employees found.</CommandEmpty>
                                                                            <CommandGroup className="max-h-[200px] overflow-auto">
                                                                                {employees.map((employee) => (
                                                                                    <CommandItem
                                                                                        key={employee.id}
                                                                                        onSelect={() => {
                                                                                            const newValue = selectedEmployeeIds.includes(employee.id)
                                                                                                ? selectedEmployeeIds.filter(id => id !== employee.id)
                                                                                                : [...selectedEmployeeIds, employee.id];
                                                                                            form.setValue('employeeIds', newValue);
                                                                                        }}
                                                                                    >
                                                                                        <Check
                                                                                            className={cn(
                                                                                                "mr-2 h-4 w-4",
                                                                                                selectedEmployeeIds.includes(employee.id)
                                                                                                    ? "opacity-100"
                                                                                                    : "opacity-0"
                                                                                            )}
                                                                                        />
                                                                                        {employee.name}
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {selectedEmployees.map(employee => (
                                                                        <Badge
                                                                            key={employee.id}
                                                                            variant="secondary"
                                                                            className="cursor-pointer"
                                                                            onClick={() => {
                                                                                form.setValue(
                                                                                    'employeeIds',
                                                                                    selectedEmployeeIds.filter(
                                                                                        id => id !== employee.id
                                                                                    )
                                                                                );
                                                                            }}
                                                                        >
                                                                            {employee.name} ×
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Recurring Tab */}
                                        <div className={cn(
                                            "space-y-4",
                                            activeTab === "recurring" ? "block" : "hidden"
                                        )}>
                                            <Card>
                                                <CardHeader className="p-4">
                                                    <CardTitle>Recurring Options</CardTitle>
                                                    <CardDescription>Set up recurring schedule settings</CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-4 space-y-4">
                                                    {/* Enable Recurring Checkbox */}
                                                    <FormField
                                                        control={form.control}
                                                        name="isRecurring"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-0.5">
                                                                    <FormLabel>Enable Recurring Schedule</FormLabel>
                                                                    <FormDescription className="text-sm">
                                                                        Schedule will repeat based on your settings
                                                                    </FormDescription>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {isRecurring && (
                                                        <div className="space-y-4 pt-2">
                                                            {/* Two Column Layout */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {/* Left Column - Radio Buttons */}
                                                                <div className="space-y-4">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="recurringType"
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-2">
                                                                                <FormLabel>Recurring Type</FormLabel>
                                                                                <FormControl>
                                                                                    <RadioGroup
                                                                                        onValueChange={field.onChange}
                                                                                        value={field.value}
                                                                                        className="flex flex-col space-y-1"
                                                                                    >
                                                                                        {[
                                                                                            { value: 'daily', label: 'Daily' },
                                                                                            { value: 'weekly', label: 'Weekly' },
                                                                                            { value: 'monthly', label: 'Monthly' },
                                                                                        ].map((option) => (
                                                                                            <FormItem
                                                                                                key={option.value}
                                                                                                className="flex items-center space-x-2 space-y-0"
                                                                                            >
                                                                                                <FormControl>
                                                                                                    <RadioGroupItem value={option.value} />
                                                                                                </FormControl>
                                                                                                <FormLabel className="font-normal">
                                                                                                    {option.label}
                                                                                                </FormLabel>
                                                                                            </FormItem>
                                                                                        ))}
                                                                                    </RadioGroup>
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    {/* Recurring Interval */}
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="recurringInterval"
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-2">
                                                                                <FormLabel>Repeat every</FormLabel>
                                                                                <FormControl>
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <Input
                                                                                            type="number"
                                                                                            {...field}
                                                                                            className="w-20"
                                                                                            min={1}
                                                                                        />
                                                                                        <span className="text-sm">
                                                                                            {recurringType === 'daily' && 'days'}
                                                                                            {recurringType === 'weekly' && 'weeks'}
                                                                                            {recurringType === 'monthly' && 'months'}
                                                                                        </span>
                                                                                    </div>
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>

                                                                {/* Right Column - Recurring Options */}
                                                                <div className="space-y-4">
                                                                    {/* Weekly Recurring Days */}
                                                                    {recurringType === 'weekly' && (
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="recurringDays"
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-2">
                                                                                    <FormLabel>Repeat on</FormLabel>
                                                                                    <div className="grid grid-cols-3 gap-2">
                                                                                        {weekDays.map((day) => (
                                                                                            <FormControl key={day.value}>
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    variant={field.value?.includes(day.value) ? "default" : "outline"}
                                                                                                    className="w-full h-8"
                                                                                                    onClick={() => {
                                                                                                        const current = field.value || [];
                                                                                                        const updated = current.includes(day.value)
                                                                                                            ? current.filter(d => d !== day.value)
                                                                                                            : [...current, day.value];
                                                                                                        field.onChange(updated);
                                                                                                    }}
                                                                                                >
                                                                                                    {day.label.slice(0, 3)}
                                                                                                </Button>
                                                                                            </FormControl>
                                                                                        ))}
                                                                                    </div>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    )}

                                                                    {/* Recurring End Date */}
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="recurringEndDate"
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-2">
                                                                                <FormLabel>End Recurring Schedule</FormLabel>
                                                                                <Card className="w-full max-w-[280px]">
                                                                                    <CardContent className="p-0">
                                                                                        <Calendar
                                                                                            mode="single"
                                                                                            selected={field.value}
                                                                                            onSelect={field.onChange}
                                                                                            disabled={(date) =>
                                                                                                isBefore(date, form.getValues('startDate'))
                                                                                            }
                                                                                            initialFocus
                                                                                            className="rounded-md border"
                                                                                        />
                                                                                    </CardContent>
                                                                                </Card>
                                                                                <FormDescription className="text-sm">
                                                                                    Schedule will repeat until this date
                                                                                </FormDescription>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <DialogFooter className="p-4 border-t">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {error && (
                                        <span className="text-sm text-destructive">
                                            {error}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        onClick={form.handleSubmit(handleSubmit)}
                                    >
                                        {loading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Assign Schedule
                                    </Button>
                                </div>
                            </div>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}