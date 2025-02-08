export default function TimesheetsPage() {
    const timesheets = [
      { id: 1, employee: 'John Doe', week: '2023-10-01 to 2023-10-07', hours: 40 },
      { id: 2, employee: 'Jane Smith', week: '2023-10-01 to 2023-10-07', hours: 35 },
      // Add more timesheets
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Time Sheets</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timesheets.map((sheet) => (
                <tr key={sheet.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sheet.employee}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sheet.week}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sheet.hours} hours</td>
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