// components/manager/leave/LeaveReports.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCheck, UserX, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';

// Define interfaces
interface LeaveStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  leave_types_usage: {
    [key: string]: {
      used: number;
      total: number;
    };
  };
  monthly_stats: {
    [key: string]: {
      approved: number;
      rejected: number;
      pending: number;
    };
  };
}

export default function LeaveReports() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [timeframe, setTimeframe] = useState('year'); // year, quarter, month
  const [error, setError] = useState<string | null>(null);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/leave-requests/department-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            timeframe,
          },
        });

        if (response.data.success) {
          setStats(response.data.data);
          setError(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch statistics';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id, timeframe, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select
          value={timeframe}
          onValueChange={setTimeframe}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="year">Past Year</SelectItem>
            <SelectItem value="quarter">Past Quarter</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pending_requests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Requests
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.approved_requests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total approved leaves
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Rejected Requests
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.rejected_requests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total rejected leaves
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Types Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Types Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.leave_types_usage && Object.entries(stats.leave_types_usage).map(([type, data]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{type}</span>
                  <span className="text-muted-foreground">
                    {data.used} / {data.total} days used
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(data.used / data.total) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.monthly_stats && Object.entries(stats.monthly_stats).map(([month, data]) => (
              <div key={month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{month}</span>
                  <span className="text-muted-foreground">
                    {data.approved + data.rejected + data.pending} total requests
                  </span>
                </div>
                <div className="flex h-2 gap-0.5">
                  <div
                    className="h-full rounded-l-full bg-green-500"
                    style={{
                      width: `${(data.approved / (data.approved + data.rejected + data.pending)) * 100}%`
                    }}
                  />
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${(data.pending / (data.approved + data.rejected + data.pending)) * 100}%`
                    }}
                  />
                  <div
                    className="h-full rounded-r-full bg-red-500"
                    style={{
                      width: `${(data.rejected / (data.approved + data.rejected + data.pending)) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Rejected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}