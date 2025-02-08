export default function FinancialReportsPage() {
    const financialReports = [
      { id: 1, month: 'October 2023', revenue: 100000, expenses: 60000, profit: 40000 },
      { id: 2, month: 'September 2023', revenue: 95000, expenses: 55000, profit: 40000 },
      // Add more reports
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Financial Reports</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {financialReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{report.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${report.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${report.expenses}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${report.profit}</td>
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