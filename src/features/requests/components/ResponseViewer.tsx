import { Tabs, Tab, Table, type TableColumn, type TableRow } from '@/shared/components/ui';

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
}

interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  loading,
}) => {
  // Debug: log headers to console
  if (response) {
    console.log('Response headers:', response.headers);
    console.log('Headers count:', Object.keys(response.headers).length);
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No Response Yet</p>
          <p className="text-sm mt-2">Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${response.status >= 200 && response.status < 300
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : response.status >= 400
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
          {response.status} {response.statusText}
        </span>
        <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
          {response.time}ms
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs variant="underline">
          <Tab header="Body">
            <div className="p-4 h-full overflow-auto">
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
                <code className="text-gray-800 dark:text-gray-200">
                  {typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2)}
                </code>
              </pre>
            </div>
          </Tab>
          <Tab header="Headers">
            <div className="p-4 h-full overflow-auto">
              <Table
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'value', header: 'Value' }
                ]}
                data={Object.entries(response.headers).map(([key, value]) => ({
                  name: <span className="font-mono text-gray-600 dark:text-gray-400">{key}</span>,
                  value: <span className="font-mono text-gray-800 dark:text-gray-200 break-all">{value}</span>
                }))}
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default ResponseViewer;
