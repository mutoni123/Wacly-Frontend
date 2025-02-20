// components/ui/loading.tsx
import { Skeleton } from "./skeleton";

export function LoadingState() {
    return (
        <div className="p-4 md:p-6">
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-[120px]" />
                        <Skeleton className="h-10 w-[100px]" />
                    </div>
                </div>

                {/* Table skeleton */}
                <div className="rounded-md border">
                    <div className="p-4">
                        {/* Table header skeleton */}
                        <div className="flex gap-4 border-b pb-4">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>

                        {/* Table rows skeleton */}
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 py-4 border-b last:border-0">
                                <Skeleton className="h-8 w-1/4" />
                                <Skeleton className="h-8 w-1/4" />
                                <Skeleton className="h-8 w-1/4" />
                                <Skeleton className="h-8 w-1/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}