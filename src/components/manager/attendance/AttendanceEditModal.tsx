"use client"
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

// Types
interface AttendanceRecord {
    id: string;
    user_id: string;
    clock_in: string | null;
    clock_out: string | null;
    duration: number | null;
    status: 'In Progress' | 'Completed';
    session_date: string;
    is_modified: boolean;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        department_id: string;
    };
}

interface AttendanceUpdateData {
    clock_in?: string;
    clock_out?: string;
    status: 'In Progress' | 'Completed';
    session_date?: string;
}

interface AttendanceEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendance: AttendanceRecord | null;
    onSubmit: (data: AttendanceUpdateData) => Promise<void>;
}

const STATUS_OPTIONS = [
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
] as const;

export function AttendanceEditModal({
    isOpen,
    onClose,
    attendance,
    onSubmit
}: AttendanceEditModalProps) {
    const [formData, setFormData] = useState<AttendanceUpdateData>({
        clock_in: '',
        clock_out: '',
        status: 'In Progress',
        session_date: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        if (attendance) {
            setFormData({
                clock_in: attendance.clock_in 
                    ? format(new Date(attendance.clock_in), "HH:mm")
                    : '',
                clock_out: attendance.clock_out 
                    ? format(new Date(attendance.clock_out), "HH:mm")
                    : '',
                status: attendance.status,
                session_date: attendance.session_date
            });
        } else {
            // Reset form for new entry
            setFormData({
                clock_in: '',
                clock_out: '',
                status: 'In Progress',
                session_date: format(new Date(), 'yyyy-MM-dd')
            });
        }
    }, [attendance]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Format dates properly before submission
            const submitData: AttendanceUpdateData = {
                status: formData.status,
                session_date: formData.session_date
            };

            if (formData.clock_in) {
                submitData.clock_in = `${formData.session_date}T${formData.clock_in}:00`;
            }

            if (formData.clock_out) {
                submitData.clock_out = `${formData.session_date}T${formData.clock_out}:00`;
            }

            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('Error submitting attendance:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {attendance ? 'Edit Attendance' : 'Manual Attendance Entry'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            value={formData.session_date}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                session_date: e.target.value
                            }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Clock In Time</label>
                        <Input
                            type="time"
                            value={formData.clock_in}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                clock_in: e.target.value
                            }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Clock Out Time</label>
                        <Input
                            type="time"
                            value={formData.clock_out}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                clock_out: e.target.value
                            }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: 'In Progress' | 'Completed') => 
                                setFormData(prev => ({ ...prev, status: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {attendance ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}