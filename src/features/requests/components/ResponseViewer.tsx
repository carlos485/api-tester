import { useState, useRef, useEffect } from "react";

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
  const [responseBodyHeight, setResponseBodyHeight] = useState(300); // Default height in pixels
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = responseBodyHeight;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    const deltaY = e.clientY - startYRef.current;
    const newHeight = Math.max(150, Math.min(800, startHeightRef.current + deltaY)); // Min 150px, max 800px
    setResponseBodyHeight(newHeight);
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);
  return (
    <div className="bg-white rounded-lg">
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
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    response.status >= 200 && response.status < 300
                      ? "bg-green-100 text-green-800"
                      : response.status >= 400
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
                <span className="text-sm text-gray-500">{response.time}ms</span>
              </div>
            </div>

            {/* Response Body */}
            <div className="border border-gray-200 rounded-lg bg-gray-50">
              <div 
                className="overflow-auto rounded-t-lg"
                style={{ height: `${responseBodyHeight - 20}px` }}
              >
                <div className="p-4">
                  <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap">
                    {typeof response.data === "object"
                      ? JSON.stringify(response.data, null, 2)
                      : String(response.data)}
                  </pre>
                </div>
              </div>
              
              {/* Resize Handle - Outside scroll area */}
              <div
                className="h-5 cursor-ns-resize hover:bg-gray-300 bg-gray-200 rounded-b-lg transition-colors duration-200 flex items-center justify-center border-t border-gray-300"
                onMouseDown={handleMouseDown}
                title="Drag to resize"
              >
                <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;
