'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  department: string;
  position: string;
  checkIn: Date | null;
  checkOut: Date | null;
  status: 'present' | 'late' | 'absent' | 'half-day';
}

export default function AttendanceTable() {
  const [records] = useState<AttendanceRecord[]>([
    {
      id: '1',
      employeeName: 'John Doe',
      department: 'Engineering',
      position: 'Senior Developer',
      checkIn: new Date('2024-03-20T09:00:00'),
      checkOut: new Date('2024-03-20T17:00:00'),
      status: 'present',
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      department: 'Marketing',
      position: 'Marketing Manager',
      checkIn: new Date('2024-03-20T09:30:00'),
      checkOut: null,
      status: 'late',
    },
    // Add more mock data as needed
  ]);

  const getStatusBadgeColor = (status: AttendanceRecord['status']) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      'half-day': 'bg-orange-100 text-orange-800',
    };
    return colors[status];
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200">
      {/* Table Header Shadow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gray-200/75"></div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Employee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Check In
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Check Out
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap z-10">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {record.employeeName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{record.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.checkIn ? format(record.checkIn, 'hh:mm a') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.checkOut ? format(record.checkOut, 'hh:mm a') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.checkIn && record.checkOut
                    ? `${Math.round(
                        (record.checkOut.getTime() - record.checkIn.getTime()) /
                          (1000 * 60 * 60)
                      )}h`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}