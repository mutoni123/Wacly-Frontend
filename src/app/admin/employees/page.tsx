import Link from 'next/link';

export default function LeavePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Leave Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leave Requests Card */}
        <Link
          href="/admin/leave/requests"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Leave Requests</h2>
          <p className="text-gray-600">
            View and manage all employee leave requests.
          </p>
        </Link>

        {/* Leave Types Card */}
        <Link
          href="/admin/leave/types"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Leave Types</h2>
          <p className="text-gray-600">
            Manage and configure different types of leave.
          </p>
        </Link>
      </div>
    </div>
  );
}