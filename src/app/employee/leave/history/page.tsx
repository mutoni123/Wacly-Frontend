"use client"
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent } from '@/components/ui/card';

const LeaveHistory = () => {
  const [leaveEntries] = useState([
    { 
      date: '2024-01-15', 
      type: 'Vacation', 
      startDate: '2024-01-20', 
      endDate: '2024-01-25', 
      status: 'Approved' 
    },
    { 
      date: '2024-02-01', 
      type: 'Sick Leave', 
      startDate: '2024-02-05', 
      endDate: '2024-02-06', 
      status: 'Approved' 
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leave History</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Past Leave Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Application Date</th>
                <th className="py-2 text-left">Leave Type</th>
                <th className="py-2 text-left">Start Date</th>
                <th className="py-2 text-left">End Date</th>
                <th className="py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveEntries.map((entry, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="py-2">{entry.date}</td>
                  <td className="py-2">{entry.type}</td>
                  <td className="py-2">{entry.startDate}</td>
                  <td className="py-2">{entry.endDate}</td>
                  <td className="py-2">
                    <span className={`
                      px-2 py-1 rounded text-xs
                      ${entry.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        entry.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}
                    `}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveHistory;