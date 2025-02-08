export default function SchedulePlanningPage() {
    const schedules = [
      { id: 1, employee: 'John Doe', date: '2023-10-15', shift: '9 AM - 5 PM' },
      { id: 2, employee: 'Jane Smith', date: '2023-10-15', shift: '12 PM - 8 PM' },
      // Add more schedules
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Schedule Planning</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.employee}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.shift}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
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