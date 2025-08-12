
interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, loading }) => {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400) return 'failure';
    return 'gray';
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-md p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Sending request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-md p-6">
        <div className="text-center p-8 text-gray-500">
          <p>No response yet. Send a request to see the response here.</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClasses = (status: number) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    if (status >= 200 && status < 300) return `${baseClasses} bg-green-100 text-green-800`;
    if (status >= 300 && status < 400) return `${baseClasses} bg-yellow-100 text-yellow-800`;
    if (status >= 400) return `${baseClasses} bg-red-100 text-red-800`;
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-md p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Response</h3>
          <div className="flex items-center gap-2">
            <span className={getStatusBadgeClasses(response.status)}>
              {response.status} {response.statusText}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {response.time}ms
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Headers</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {formatJson(response.headers)}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Body</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <pre className="text-sm overflow-x-auto max-h-96 overflow-y-auto">
              {formatJson(response.data)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseViewer;