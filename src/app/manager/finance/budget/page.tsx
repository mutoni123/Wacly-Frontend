export default function BudgetOverviewPage() {
    const budgetData = [
      { id: 1, category: 'Salaries', allocated: 50000, used: 45000, remaining: 5000 },
      { id: 2, category: 'Training', allocated: 10000, used: 7000, remaining: 3000 },
      // Add more budget data
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Budget Overview</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budgetData.map((budget) => (
                <tr key={budget.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{budget.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${budget.allocated}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${budget.used}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${budget.remaining}</td>
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