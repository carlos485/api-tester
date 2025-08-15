interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, loading }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
      {/* Response Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900">Response</h3>
      </div>

      {/* Response Content */}
      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        )}

        {!loading && !response && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No response yet</div>
          </div>
        )}

        {!loading && response && (
          <div className="space-y-4">
            {/* Status and Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  response.status >= 200 && response.status < 300
                    ? "bg-green-100 text-green-800"
                    : response.status >= 400
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-sm text-gray-500">
                  {response.time}ms
                </span>
              </div>
            </div>

            {/* Response Body */}
            <div>
              <div className="bg-gray-50 rounded-lg p-4 min-h-48">
                <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap">
                  {typeof response.data === 'object' 
                    ? JSON.stringify(response.data, null, 2)
                    : response.data
                  }
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;