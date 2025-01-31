'use client';

interface TaskCategory {
  name: string;
  total: number;
  completed: number;
  color: string;
}

export default function TasksOverview() {
  const categories: TaskCategory[] = [
    {
      name: 'Development',
      total: 12,
      completed: 8,
      color: 'blue',
    },
    {
      name: 'Design',
      total: 8,
      completed: 5,
      color: 'purple',
    },
    {
      name: 'Testing',
      total: 6,
      completed: 2,
      color: 'green',
    },
    {
      name: 'Documentation',
      total: 4,
      completed: 3,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-600 text-2xl font-bold">27</div>
          <div className="text-blue-600 text-sm">Total Tasks</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-600 text-2xl font-bold">18</div>
          <div className="text-green-600 text-sm">Completed</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                {category.name}
              </span>
              <span className="text-sm text-gray-500">
                {category.completed}/{category.total}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 bg-${category.color}-500 rounded-full`}
                style={{
                  width: `${(category.completed / category.total) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Updates */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-3">Recent Updates</h3>
        <div className="space-y-3">
          {[
            {
              task: 'Homepage Design',
              status: 'Completed',
              time: '2h ago',
            },
            {
              task: 'API Integration',
              status: 'In Progress',
              time: '4h ago',
            },
            {
              task: 'Bug Fixes',
              status: 'In Review',
              time: '6h ago',
            },
          ].map((update, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium text-gray-800">{update.task}</p>
                <p className="text-gray-500">{update.time}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  update.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : update.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {update.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}