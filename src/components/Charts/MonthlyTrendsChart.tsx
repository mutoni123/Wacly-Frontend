// components/Charts/MonthlyTrendsChart.tsx
import { useEffect, useState, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/contsants";

// Interfaces
interface LeaveType {
    id: number;
    name: string;
    days_allowed: number;
    status: 'Active' | 'Inactive';
}

interface LeaveRequest {
    id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    number_of_days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

interface MonthlyData {
    name: string;
    total: number;
    [key: string]: number | string;
}

interface TooltipPayloadItem {
    color: string;
    name: string;
    value: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

const CHART_COLORS = [
    '#3B82F6', // Blue-500
    '#10B981', // Emerald-500
    '#F59E0B', // Amber-500
    '#8B5CF6', // Violet-500
    '#EC4899', // Pink-500
    '#06B6D4', // Cyan-500
    '#84CC16', // Lime-500
    '#A855F7', // Purple-500
];

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
            <p className="font-medium text-sm mb-2">{label}</p>
            <div className="space-y-1.5">
                {payload.map((entry, index) => (
                    <div 
                        key={index}
                        className="flex items-center gap-2 text-sm"
                    >
                        <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600">
                            {entry.name}:
                        </span>
                        <span className="font-medium">
                            {entry.value} days
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MonthlyTrendsChart = () => {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const processLeaveData = useCallback((
        leaveRequests: LeaveRequest[],
        leaveTypesList: LeaveType[]
    ) => {
        // Initialize monthly data with typed values
        const monthsData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
            name: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
            total: 0,
            ...Object.fromEntries(leaveTypesList.map(type => [type.name, 0]))
        }));

        // Process leave requests
        leaveRequests.forEach(leave => {
            if (leave.status !== 'Approved') return;
            
            const startDate = new Date(leave.start_date);
            const month = startDate.getMonth();
            const leaveType = leaveTypesList.find(type => type.id === leave.leave_type_id);

            if (leaveType) {
                // Safe type assertions for numeric operations
                monthsData[month].total = (monthsData[month].total as number) + leave.number_of_days;
                const currentTypeValue = monthsData[month][leaveType.name] as number;
                monthsData[month][leaveType.name] = currentTypeValue + leave.number_of_days;
            }
        });

        return monthsData;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const [leaveTypesRes, leaveRequestsRes] = await Promise.all([
                fetch(`${API_BASE}/leave-types`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/leave-requests`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!leaveTypesRes.ok || !leaveRequestsRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const [leaveTypesData, leaveRequestsData] = await Promise.all([
                leaveTypesRes.json(),
                leaveRequestsRes.json()
            ]);

            if (leaveTypesData.success && leaveRequestsData.success) {
                const activeLeaveTypes = leaveTypesData.data
                    .filter((type: LeaveType) => type.status === 'Active');
                setLeaveTypes(activeLeaveTypes);
                setMonthlyData(processLeaveData(leaveRequestsData.data, activeLeaveTypes));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [processLeaveData, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-lg" />
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                    vertical={false}
                />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs font-medium"
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-xs font-medium"
                    tickFormatter={(value) => `${value}d`}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    className="text-sm"
                />
                {leaveTypes.map((leaveType, index) => (
                    <Bar
                        key={leaveType.id}
                        dataKey={leaveType.name}
                        stackId="a"
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};