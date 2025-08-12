import { Card, Badge } from 'flowbite-react';

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
      <Card className="w-full">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Sending request...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="w-full">
        <div className="text-center p-8 text-gray-500">
          <p>No response yet. Send a request to see the response here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Response</h3>
          <div className="flex items-center gap-2">
            <Badge color={getStatusColor(response.status)}>
              {response.status} {response.statusText}
            </Badge>
            <Badge color="gray">{response.time}ms</Badge>
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
    </Card>
  );
};

export default ResponseViewer;