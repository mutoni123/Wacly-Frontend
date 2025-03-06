// components/StatsCard.tsx
interface StatsCardProps {
    title: string;
    value: number | string;
    change: number;
    changeLabel: string;
    icon: React.ReactNode;
    isLoading?: boolean;
    isNegative?: boolean;
  }
  
  export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    isLoading,
    isNegative = false,
  }: StatsCardProps) {
    if (isLoading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
          <div className="h-16 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      );
    }
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
            {isNegative ? '' : '+'}{change}
          </span>
          <span className="text-gray-600 ml-2">{changeLabel}</span>
        </div>
      </div>
    );
  }