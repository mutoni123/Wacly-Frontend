'use client';

import Header from '@/components/AdminHeader';
import { RadialChart } from '@/components/Charts/RadialChart';
import Calendar from '@/components/Calendar';
import AttendanceTable from '@/components/Tables/AttendanceTable';
import Timeline from '@/components/Timeline';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 prevents flex child from overflowing */}
        <Header />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            {/* Widget 1: Employees on Leave */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">On Leave</h2>
              <p className="text-2xl lg:text-3xl font-bold text-orange-500 mt-2">15</p>
              <p className="text-sm text-gray-500 mt-1">Total employees on leave</p>
            </div>

            {/* Widget 2: Total Employees */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Total Staff</h2>
              <p className="text-2xl lg:text-3xl font-bold text-blue-500 mt-2">156</p>
              <p className="text-sm text-gray-500 mt-1">Active employees</p>
            </div>

            {/* Widget 3: Departments */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Departments</h2>
              <p className="text-2xl lg:text-3xl font-bold text-green-500 mt-2">8</p>
              <p className="text-sm text-gray-500 mt-1">Active departments</p>
            </div>

            {/* Widget 4: Pending Requests */}
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Pending</h2>
              <p className="text-2xl lg:text-3xl font-bold text-purple-500 mt-2">23</p>
              <p className="text-sm text-gray-500 mt-1">Leave requests</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Section */}
            <div className="lg:w-2/3 space-y-4 lg:space-y-6">
              {/* Gender Distribution Chart */}
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                  Gender Distribution
                </h2>
                <div className="h-[300px] lg:h-[400px]">
                  <RadialChart />
                </div>
              </div>

              {/* Attendance Table */}
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
              {/* Calendar */}
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <Calendar />
              </div>

              {/* Timeline */}
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