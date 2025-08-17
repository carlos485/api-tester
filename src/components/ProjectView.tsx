import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project, ApiRequest, ApiResponse } from "../types/project";
import QuickRequestBar from "./QuickRequestBar";
import RequestTabs from "./RequestTabs";
import ResponseViewer from "./ResponseViewer";

interface ProjectViewProps {
  project: Project;
  onBackToHome: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBackToHome }) => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuickRequestBar
          onSendRequest={handleQuickRequest}
          environments={project.environments}
        />
        <RequestTabs />
        <div className="mt-6">
          <ResponseViewer response={response} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
