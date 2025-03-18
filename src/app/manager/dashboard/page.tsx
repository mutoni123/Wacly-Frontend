// src/app/manager/dashboard/page.tsx
'use client';

import { DashboardStats } from '@/components/manager/dashboard/StatisticsCard';
import { ActivityFeed } from '@/components/manager/dashboard/ActivityFeed';

export default function ManagerDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardStats />
      <ActivityFeed />
    </div>
  );
}