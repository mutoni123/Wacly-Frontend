// components/Tables/TaskTable.js
export default function TaskTable() {
    const tasks = [
      { id: 1, title: 'Fix UI Bugs', status: 'Completed', deadline: '2023-10-15' },
      { id: 2, title: 'Write API Documentation', status: 'Pending', deadline: '2023-10-20' },
      { id: 3, title: 'Test New Feature', status: 'Overdue', deadline: '2023-10-10' },
    ];
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }