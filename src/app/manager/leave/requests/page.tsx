export default function LeaveRequestsPage() {
    const leaveRequests = [
      { id: 1, employee: 'John Doe', type: 'Vacation', startDate: '2023-10-01', endDate: '2023-10-05', status: 'Pending' },
      { id: 2, employee: 'Jane Smith', type: 'Sick Leave', startDate: '2023-10-02', endDate: '2023-10-03', status: 'Approved' },
      // Add more leave requests
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{request.employee}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.startDate} to {request.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        request.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900">Approve</button>
                    <button className="text-red-600 hover:text-red-900 ml-4">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }