export default function TaskAssignmentPage() {
    const tasks = [
      { id: 1, title: 'Project Setup', assignedTo: 'John Doe', deadline: '2023-10-15', status: 'In Progress' },
      { id: 2, title: 'UI Design', assignedTo: 'Jane Smith', deadline: '2023-10-20', status: 'Pending' },
      // Add more tasks
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Task Assignment</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.assignedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.deadline}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        task.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : task.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
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