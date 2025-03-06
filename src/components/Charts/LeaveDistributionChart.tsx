// components/Charts/LeaveDistributionChart.tsx
import { useState, useCallback, useEffect } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/contsants";

interface LeaveType {
    id: number;
    name: string;
    days_allowed: number;
    carry_forward: boolean;
    description: string;
    requires_approval: boolean;
    status: 'Active' | 'Inactive';
}

interface ChartData {
    name: string;
    value: number;
    description: string;
}

const COLORS = [
    '#3B82F6', // Blue-500
    '#10B981', // Emerald-500
    '#F59E0B', // Amber-500
    '#8B5CF6', // Violet-500
    '#EC4899', // Pink-500
];

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value
    } = props;

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
                opacity={0.8}
            />
            <path
                d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                stroke={fill}
                strokeWidth={2}
                fill="none"
                className="transition-all duration-200"
            />
            <circle
                cx={ex}
                cy={ey}
                r={2}
                fill={fill}
                stroke="none"
            />
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey - 12}
                dy={-8}
                textAnchor={textAnchor}
                fill="#374151"
                className="font-medium text-sm"
            >
                {payload.name}
            </text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                textAnchor={textAnchor}
                fill="#6B7280"
                className="text-xs"
            >
                {payload.description}
            </text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                dy={16}
                textAnchor={textAnchor}
                fill="#374151"
                className="text-sm font-medium"
            >
                {`${value} days (${(percent * 100).toFixed(1)}%)`}
            </text>
        </g>
    );
};

export const LeaveDistributionChart = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [leaveTypes, setLeaveTypes] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const onPieEnter = useCallback((_, index: number) => {
        setActiveIndex(index);
    }, []);

    const fetchLeaveTypes = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }
            const response = await fetch(`${API_BASE}/leave-types`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch leave types');
            }
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                const activeLeaveTypes = data.data
                    .filter((type: LeaveType) => type.status === 'Active')
                    .map((type: LeaveType) => ({
                        name: type.name,
                        value: type.days_allowed,
                        description: type.description
                    }));
                setLeaveTypes(activeLeaveTypes);
            }
        } catch (error) {
            console.error('Error fetching leave types:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch leave types",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLeaveTypes();
    }, [fetchLeaveTypes]);

    if (isLoading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-lg" />
            </div>
        );
    }

    if (leaveTypes.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                No leave types available
            </div>
        );
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={leaveTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                    >
                        {leaveTypes.map((_, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                className="stroke-background hover:opacity-90 transition-all duration-200"
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};