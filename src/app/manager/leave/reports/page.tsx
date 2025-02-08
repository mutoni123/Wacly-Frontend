export default function LeaveReportsPage() {
    const leaveReports = [
      { id: 1, month: 'October 2023', totalRequests: 15, approved: 10, rejected: 5 },
      { id: 2, month: 'September 2023', totalRequests: 12, approved: 8, rejected: 4 },
      // Add more reports
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Leave Reports</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{report.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.totalRequests}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.approved}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.rejected}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                    <button className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }