// app/employee/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TaskTable from '@/components/Tables/TaskTable';
import TasksOverview from '@/components/TasksOverview';
import { StatsCard } from '@/components/StatsCard';
import { 
  TaskIcon, 
  CompletedIcon, 
  PendingIcon, 
  PerformanceIcon 
} from '@/components/icons';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  performance: number;
  newTasks: number;
  overdueTasks: number;
  weeklyChange: number;
}

export default function EmployeeDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    performance: 0,
    newTasks: 0,
    overdueTasks: 0,
    weeklyChange: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const response = await fetch('/api/tasks/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching task stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user) {
      fetchTaskStats();
    }
  }, [user]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Tasks Card */}
            <StatsCard
              title="Total Tasks"
              value={stats.total}
              change={stats.newTasks}
              changeLabel="new tasks this week"
              icon={<TaskIcon />}
              isLoading={isLoadingStats}
            />
            
            {/* Completed Tasks Card */}
            <StatsCard
              title="Completed Tasks"
              value={stats.completed}
              change={Math.round((stats.completed / stats.total) * 100)}
              changeLabel="completion rate"
              icon={<CompletedIcon />}
              isLoading={isLoadingStats}
            />
            
            {/* Pending Tasks Card */}
            <StatsCard
              title="Pending Tasks"
              value={stats.pending}
              change={stats.overdueTasks}
              changeLabel="overdue"
              icon={<PendingIcon />}
              isLoading={isLoadingStats}
              isNegative
            />
            
            {/* Performance Card */}
            <StatsCard
              title="Your Performance"
              value={`${stats.performance}%`}
              change={stats.weeklyChange}
              changeLabel="from last week"
              icon={<PerformanceIcon />}
              isLoading={isLoadingStats}
            />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Table */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Your Tasks
                </h2>
                <TaskTable />
              </div>
            </div>

            {/* Tasks Overview */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Tasks Overview
                </h2>
                <TasksOverview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}