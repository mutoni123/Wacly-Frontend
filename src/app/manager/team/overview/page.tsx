// src/app/manager/team/overview/page.tsx
'use client';

import { EmployeeList } from '@/components/manager/team/EmployeeList';
import { PerformanceChart } from '@/components/manager/team/PerformanceChart';
import { TaskBoard } from '@/components/manager/team/TaskBoard';

export default function TeamOverview() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Team Overview</h1>
      <EmployeeList />
      <PerformanceChart />
      <TaskBoard />
    </div>
  );
}