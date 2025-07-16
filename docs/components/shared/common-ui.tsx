export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-gray-600 font-medium">Initializing URPC...</div>
        <div className="text-gray-400 text-sm mt-1">
          Setting up data adapters and mock data
        </div>
      </div>
    </div>
  );
};

export const ErrorState = ({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void; 
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 text-red-400">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="text-red-600 text-lg font-semibold mb-2">
          Initialization Failed
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );
}; 