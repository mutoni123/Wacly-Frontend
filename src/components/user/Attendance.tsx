"use client"
import { useState } from 'react';

export default function Attendance() {
  const [attendanceData] = useState([
    { date: '2024-03-01', checkIn: '09:00 AM', checkOut: '05:00 PM', status: 'Present' },
    { date: '2024-03-02', checkIn: '08:55 AM', checkOut: '05:30 PM', status: 'Present' },
    { date: '2024-03-03', checkIn: '09:15 AM', checkOut: '05:00 PM', status: 'Late' },
    { date: '2024-03-04', checkIn: '-', checkOut: '-', status: 'Absent' },
    { date: '2024-03-05', checkIn: '09:00 AM', checkOut: '05:00 PM', status: 'Present' },
  ]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        {/* Attendance Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance Record</h3>
          <p className="mt-1 text-sm text-gray-500">Your attendance history for the current month</p>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Present Days</h4>
            <p className="text-2xl font-semibold text-green-600">18</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-800">Absent Days</h4>
            <p className="text-2xl font-semibold text-red-600">2</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800">Late Days</h4>
            <p className="text-2xl font-semibold text-yellow-600">1</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkIn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkOut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}