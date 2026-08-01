import React from "react";

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center p-4 my-4 bg-red-950/30 border border-red-900/50 rounded-xl max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm">{message}</span>
            </div>
            {onRetry && (
                <button 
                    onClick={onRetry}
                    className="mt-3 px-4 py-1.5 bg-red-900/50 hover:bg-red-900/80 text-red-200 text-xs rounded-lg transition-colors border border-red-800/50"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};
