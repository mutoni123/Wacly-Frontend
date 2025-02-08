export default function TeamOverviewPage() {
    const teamMembers = [
      { id: 1, name: 'John Doe', role: 'Developer', department: 'Engineering' },
      { id: 2, name: 'Jane Smith', role: 'Designer', department: 'Design' },
      // Add more team members
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Team Overview</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                    <button className="text-red-600 hover:text-red-900 ml-4">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }