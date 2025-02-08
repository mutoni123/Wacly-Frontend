export default function TeamPerformancePage() {
    const performanceData = [
      { id: 1, employee: 'John Doe', rating: 4.5, feedback: 'Excellent work on the project.' },
      { id: 2, employee: 'Jane Smith', rating: 3.8, feedback: 'Good performance, but needs improvement in communication.' },
      // Add more performance data
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Performance Reviews</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData.map((data) => (
                <tr key={data.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{data.employee}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{data.rating}/5</td>
                  <td className="px-6 py-4 whitespace-nowrap">{data.feedback}</td>
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