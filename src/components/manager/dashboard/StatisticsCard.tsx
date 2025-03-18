// src/components/manager/dashboard/StatisticsCard.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { UsersIcon, ClockIcon, CalendarDaysIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface StatisticProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatisticCard = ({ title, value, icon, description, trend }: StatisticProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {trend && (
          <div className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const DashboardStats = () => {
  const stats = [
    {
      title: "Team Members",
      value: "12",
      icon: <UsersIcon className="w-6 h-6 text-blue-600" />,
      description: "Active team members",
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Attendance Rate",
      value: "95%",
      icon: <ClockIcon className="w-6 h-6 text-green-600" />,
      description: "This month",
      trend: { value: 3, isPositive: true }
    },
    {
      title: "Pending Leaves",
      value: "4",
      icon: <CalendarDaysIcon className="w-6 h-6 text-orange-600" />,
      description: "Requests to review",
    },
    {
      title: "Tasks Completed",
      value: "28",
      icon: <CheckCircleIcon className="w-6 h-6 text-purple-600" />,
      description: "This week",
      trend: { value: 12, isPositive: true }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat) => (
        <StatisticCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};