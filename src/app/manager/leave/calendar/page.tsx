import { Calendar } from '@/components/ui/calendar'; // Assuming you're using a calendar component

export default function LeaveCalendarPage() {
  const leaveDates = [
    { date: '2023-10-01', employee: 'John Doe', type: 'Vacation' },
    { date: '2023-10-05', employee: 'Jane Smith', type: 'Sick Leave' },
    // Add more leave dates
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leave Calendar</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <Calendar
          events={leaveDates.map((leave) => ({
            date: new Date(leave.date),
            title: `${leave.employee} - ${leave.type}`,
          }))}
        />
      </div>
    </div>
  );
}