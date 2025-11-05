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
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      {/* Response content will be implemented here */}
    </div>
  );
};

export default ResponseViewer;
