export default function ExpenseReportsPage() {
    const expenses = [
      { id: 1, date: '2023-10-01', category: 'Office Supplies', amount: 500, description: 'Printer ink and paper' },
      { id: 2, date: '2023-10-05', category: 'Travel', amount: 1200, description: 'Client meeting travel expenses' },
      // Add more expenses
    ];
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Expense Reports</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{expense.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{expense.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${expense.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{expense.description}</td>
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