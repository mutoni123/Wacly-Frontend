'use client';

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Clock, AlertCircle, Building2 } from "lucide-react";
import { LeaveDistributionChart } from "@/components/Charts/LeaveDistributionChart";
import { MonthlyTrendsChart } from "@/components/Charts/MonthlyTrendsChart";
import { DepartmentLeaveTable } from "@/components/Tables/DepartmentLeaveTable";
import { LeaveCalendar } from "@/components/LeaveCalendar";
import { API_BASE } from "@/lib/contsants";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
    pendingRequests: {
        total: number;
        change: number;
    };
    onLeaveToday: {
        total: number;
        departments: number;
    };
    upcomingLeaves: {
        total: number;
    };
    monthlyLeaves: {
        current: number;
        previous: number;
    };
}

export default function LeaveDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        pendingRequests: { total: 0, change: 0 },
        onLeaveToday: { total: 0, departments: 0 },
        upcomingLeaves: { total: 0 },
        monthlyLeaves: { current: 0, previous: 0 }
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');
    
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
    
            // Use the correct endpoint
            const response = await fetch(`${API_BASE}/leave-requests/dashboard-stats`, {
                headers
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }
    
            const { data } = await response.json();
            
            setStats({
                pendingRequests: {
                    total: data.pending,
                    change: data.pendingChange
                },
                onLeaveToday: {
                    total: data.onLeaveToday,
                    departments: data.departmentsAffected
                },
                upcomingLeaves: {
                    total: data.upcoming
                },
                monthlyLeaves: {
                    current: data.currentMonth,
                    previous: data.previousMonth
                }
            });
    
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast({
                title: "Error",
                description: "Failed to load dashboard statistics",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-4">
                            <div className="h-20 animate-pulse bg-muted rounded-md" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Title */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">
                    Leave Management Dashboard
                </h1>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pending Requests */}
                <Card className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Pending Requests
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.pendingRequests.total}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.pendingRequests.change >= 0 ? '+' : ''}
                                {stats.pendingRequests.change} from yesterday
                            </p>
                        </div>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                </Card>

                {/* Currently on Leave */}
                <Card className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                On Leave Today
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.onLeaveToday.total}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.onLeaveToday.departments} departments affected
                            </p>
                        </div>
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                </Card>

                {/* Upcoming Leaves */}
                <Card className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Upcoming (7 days)
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.upcomingLeaves.total}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Starting from tomorrow
                            </p>
                        </div>
                        <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                </Card>

                {/* Total This Month */}
                <Card className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total This Month
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.monthlyLeaves.current}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                vs. {stats.monthlyLeaves.previous} last month
                            </p>
                        </div>
                        <Clock className="h-5 w-5 text-purple-500" />
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Type Distribution */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Leave Distribution by Type</h2>
                    <LeaveDistributionChart />
                </Card>

                {/* Monthly Trends */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Monthly Leave Trends</h2>
                    <MonthlyTrendsChart />
                </Card>
            </div>

            {/* Department Overview and Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department Leave Status */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Department Leave Status</h2>
                        <Building2 className="h-5 w-5 text-gray-500" />
                    </div>
                    <DepartmentLeaveTable />
                </Card>

                {/* Leave Calendar */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Leave Calendar</h2>
                    <LeaveCalendar />
                </Card>
            </div>
        </div>
    );
}