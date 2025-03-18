// src/components/manager/dashboard/ActivityFeed.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Activity {
  id: string;
  type: 'leave_request' | 'clock_in' | 'clock_out' | 'task_complete';
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  description: string;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'leave_request':
      return '🗓️';
    case 'clock_in':
      return '🟢';
    case 'clock_out':
      return '🔴';
    case 'task_complete':
      return '✅';
    default:
      return '📝';
  }
};

const ActivityItem = ({ activity }: { activity: Activity }) => (
  <div className="flex items-start space-x-4 py-3">
    <div className="text-xl">
      {getActivityIcon(activity.type)}
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">
          {activity.user.name}
        </p>
        <span className="text-xs text-gray-500">
          {format(activity.timestamp, 'h:mm a')}
        </span>
      </div>
      <p className="text-sm text-gray-500">
        {activity.description}
      </p>
    </div>
  </div>
);

export const ActivityFeed = () => {
  // Example data - replace with actual API call
  const activities: Activity[] = [
    {
      id: '1',
      type: 'leave_request',
      user: { name: 'John Doe' },
      timestamp: new Date(),
      description: 'Requested annual leave for next week'
    },
    {
      id: '2',
      type: 'clock_in',
      user: { name: 'Jane Smith' },
      timestamp: new Date(Date.now() - 3600000),
      description: 'Clocked in for the day'
    },
    {
      id: '3',
      type: 'task_complete',
      user: { name: 'Mike Johnson' },
      timestamp: new Date(Date.now() - 7200000),
      description: 'Completed quarterly report review'
    },
    // Add more activities as needed
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No recent activities
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Optional: Add loading state component
export const ActivityFeedSkeleton = () => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 py-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);