'use client';

import Header from '@/components/AdminHeader';
import { RadialChart } from '@/components/Charts/RadialChart';
import Calendar from '@/components/Calendar';
import AttendanceTable from '@/components/Tables/AttendanceTable';
import Timeline from '@/components/Timeline';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { stats, isLoading } = useAdminStats();

  const StatWidget = ({ title, value, subtext, colorClass }: {
    title: string;
    value: number;
    subtext: string;
    colorClass: string;
  }) => (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-800">{title}</h2>
      {isLoading ? (
        <Skeleton className="h-10 w-20 mt-2" />
      ) : (
        <p className={`text-2xl lg:text-3xl font-bold ${colorClass} mt-2`}>
          {value}
        </p>
      )}
      <p className="text-sm text-gray-500 mt-1">{subtext}</p>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <StatWidget
              title="On Leave"
              value={stats.onLeave}
              subtext="Total employees on leave"
              colorClass="text-orange-500"
            />
            <StatWidget
              title="Total Staff"
              value={stats.totalStaff}
              subtext="Active employees"
              colorClass="text-blue-500"
            />
            <StatWidget
              title="Departments"
              value={stats.departments}
              subtext="Active departments"
              colorClass="text-green-500"
            />
            <StatWidget
              title="Pending"
              value={stats.pendingRequests}
              subtext="Leave requests"
              colorClass="text-purple-500"
            />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Section */}
            <div className="lg:w-2/3 space-y-4 lg:space-y-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                  Gender Distribution
                </h2>
                <div className="h-[300px] lg:h-[400px]">
                  <RadialChart />
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                  Live Attendance Record
                </h2>
                <div className="overflow-x-auto">
                  <AttendanceTable />
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="lg:w-1/3 space-y-4 lg:space-y-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <Calendar />
              </div>
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                  Coming Up
                </h2>
                <Timeline />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}