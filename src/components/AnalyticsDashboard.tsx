import React from 'react';
import { DepartmentAnalytics } from './types';

interface AnalyticsDashboardProps {
  analytics: DepartmentAnalytics | null;
  isLoading: boolean;
}

export function AnalyticsDashboard({ analytics, isLoading }: AnalyticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 p-4 rounded-lg h-24" />
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Total Employees</h3>
        <p className="text-2xl font-bold">{analytics.totalEmployees}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Performance</h3>
        <p className="text-2xl font-bold">{analytics.averagePerformance}%</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Total Budget</h3>
        <p className="text-2xl font-bold">${analytics.totalBudget.toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Active Projects</h3>
        <p className="text-2xl font-bold">{analytics.activeProjects}</p>
      </div>
    </div>
  );
}