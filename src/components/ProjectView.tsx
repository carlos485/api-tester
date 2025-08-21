import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project, ApiRequest, ApiResponse, Endpoint } from "../types/project";
import QuickRequestBar from "./QuickRequestBar";
import RequestTabs from "./RequestTabs";
import ResponseViewer from "./ResponseViewer";
import { Tabs, Tab } from "./Tabs";
import Sidebar from "./Sidebar";
import { useEndpoints } from "../hooks/useEndpoints";

interface ProjectViewProps {
  project: Project;
  onBackToHome: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBackToHome }) => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>();
  
  // Use the endpoints hook for real Firebase data
  const {
    endpoints,
    loading: endpointsLoading,
    error: endpointsError,
    createEndpoint
  } = useEndpoints(project.id);

  const handleSendRequest = async (request: ApiRequest) => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: request.headers,
        mode: "cors",
      };

      if (
        request.method !== "GET" &&
        request.method !== "HEAD" &&
        request.body
      ) {
        fetchOptions.body = request.body;
      }

      console.log("Making request to:", request.url);
      console.log("Request options:", fetchOptions);

      const response = await fetch(request.url, fetchOptions);
      const endTime = Date.now();

      console.log("Response received:", response.status, response.statusText);

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers,
        data,
        time: endTime - startTime,
      });
    } catch (error) {
      const endTime = Date.now();
      console.error("Request failed:", error);

      let errorMessage = "Unknown error";
      let errorDetails = {};

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Connection failed - Server may be unreachable, CORS blocked, or SSL certificate invalid";
        errorDetails = {
          type: "Connection Error",
          possibleCauses: [
            "Server is down or unreachable",
            "CORS policy blocking the request",
            "Invalid SSL certificate",
            "Network/firewall blocking the connection",
          ],
          suggestion:
            "Try the URL in your browser first to check if it's accessible",
        };
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = { originalError: error.name };
      }

      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: {
          error: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString(),
        },
        time: endTime - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRequest = (quickRequest: {
    method: string;
    url: string;
  }) => {
    const request: ApiRequest = {
      method: quickRequest.method,
      url: quickRequest.url,
      headers: {},
      body: "",
    };
    handleSendRequest(request);
  };

  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpointId(endpoint.id);
    // Optionally auto-populate the request form with endpoint data
    const request: ApiRequest = {
      method: endpoint.method,
      url: endpoint.url,
      headers: endpoint.headers || {},
      body: endpoint.body || "",
    };
    // Could trigger form update here or automatically send request
    handleSendRequest(request);
  };

  const handleAddEndpoint = async () => {
    try {
      await createEndpoint({
        name: "New Endpoint",
        method: "GET",
        url: "https://api.example.com",
        description: "New endpoint description",
      });
    } catch (error) {
      console.error("Failed to create endpoint:", error);
      // Here you could show a toast notification
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to projects"
              >
                <Icon icon="material-symbols:arrow-back" className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon icon={project.icon} className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="text-gray-600 text-sm">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button className="cursor-pointer p-2 border-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Icon icon="material-symbols:settings" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex gap-6 my-8">
            {/* Sidebar */}
            <Sidebar
              endpoints={endpoints}
              onEndpointSelect={handleEndpointSelect}
              onAddEndpoint={handleAddEndpoint}
              selectedEndpointId={selectedEndpointId}
              loading={endpointsLoading}
            />
            
            {/* Content Area */}
            <div className="flex-1 overflow-auto">
              {endpointsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <Icon icon="material-symbols:error" className="h-4 w-4" />
                    <span>Error loading endpoints: {endpointsError}</span>
                  </div>
                </div>
              )}
              
              <Tabs defaultActiveTab={0}>
                <Tab header="Coupons">
                  <QuickRequestBar
                    onSendRequest={handleQuickRequest}
                    environments={project.environments}
                  />
                  <RequestTabs />
                  <div className="mt-6">
                    <ResponseViewer response={response} loading={loading} />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
