// src/components/manager/team/PerformanceChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PerformanceData {
  month: string;
  productivity: number;
  attendance: number;
  tasks_completed: number;
}

export const PerformanceChart = () => {
  // Replace with actual API call
  const performanceData: PerformanceData[] = [
    {
      month: "Jan",
      productivity: 85,
      attendance: 92,
      tasks_completed: 78
    },
    // Add more months...
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Performance</CardTitle>
        <Select defaultValue="6months">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="productivity" 
                stroke="#8884d8" 
                name="Productivity"
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#82ca9d" 
                name="Attendance"
              />
              <Line 
                type="monotone" 
                dataKey="tasks_completed" 
                stroke="#ffc658" 
                name="Tasks Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};