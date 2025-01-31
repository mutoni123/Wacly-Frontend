'use client';

import Sidebar from '@/components/sidebar';
import Header from '@/components/Employeeheader';
import TaskTable from '@/components/Tables/TaskTable';
import TasksOverview from '@/components/TasksOverview';

export default function EmployeeDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Tasks */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">+3</span>
                <span className="text-gray-600 ml-2">new tasks this week</span>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">10</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">67%</span>
                <span className="text-gray-600 ml-2">completion rate</span>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-red-500 font-medium">2</span>
                <span className="text-gray-600 ml-2">overdue</span>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Performance</p>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">+5%</span>
                <span className="text-gray-600 ml-2">from last week</span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Table */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Tasks</h2>
                <TaskTable />
              </div>
            </div>

            {/* Tasks Overview */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks Overview</h2>
                <TasksOverview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}