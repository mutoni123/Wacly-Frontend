// src/components/manager/team/tasks/LoadingState.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TasksLoadingState() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
        >
          <div className="space-y-4 md:flex-1">
            {/* Title and Priority */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            {/* Description */}
            <Skeleton className="h-4 w-3/4" />
            
            {/* Assignee and Date */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Also create a loading state for the header
export function TasksHeaderLoadingState() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-2 flex-1">
        <Skeleton className="h-10 w-full md:w-72" /> {/* Search input */}
        <Skeleton className="h-10 w-[180px]" /> {/* Filter select */}
      </div>
    </div>
  );
}

// Card Loading State
export function TaskCardLoading() {
  return (
    <Card>
      <CardHeader>
        <TasksHeaderLoadingState />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <TasksLoadingState />
        </div>
      </CardContent>
    </Card>
  );
}