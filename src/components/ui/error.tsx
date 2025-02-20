// components/ui/error.tsx
import { AlertCircle } from 'lucide-react';
import { Button } from "./button";

interface ErrorStateProps {
    message: string;
    onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="p-4 md:p-6">
            <div className="max-w-md mx-auto text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-red-600 mb-4">
                        {message}
                    </p>
                    <Button
                        variant="outline"
                        onClick={onRetry}
                        className="bg-white hover:bg-red-50"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}