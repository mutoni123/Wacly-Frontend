import Link from 'next/link';

export default function LeaveSummaryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Leave Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Leave Requests */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
          <p className="text-gray-600 text-2xl font-bold">12</p>
        </div>

        {/* Approved Leaves */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Approved Leaves</h2>
          <p className="text-gray-600 text-2xl font-bold">24</p>
        </div>

        {/* Rejected Leaves */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Rejected Leaves</h2>
          <p className="text-gray-600 text-2xl font-bold">5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leave Requests Link */}
        <Link
          href="/admin/leave/requests"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Leave Requests</h2>
          <p className="text-gray-600">View and manage all employee leave requests.</p>
        </Link>

        {/* Leave Types Link */}
        <Link
          href="/admin/leave/types"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Leave Types</h2>
          <p className="text-gray-600">Manage and configure different types of leave.</p>
        </Link>
      </div>
    </div>
  );
}
