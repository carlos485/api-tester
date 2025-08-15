import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import QuickRequestBar from "./components/QuickRequestBar";
import RequestTabs from "./components/RequestTabs";
import ResponseViewer from "./components/ResponseViewer";

interface ApiRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
}

function App() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async (request: ApiRequest) => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: request.headers,
        mode: "cors", // Explicitly set CORS mode
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
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-around">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Tester</h1>
          <button className="cursor-pointer p-2 border-2 rounded-lg">
            <Icon icon="material-symbols:settings" />
          </button>
        </div>
      </header>
      <div className="max-w-7xl my-6 mx-auto px-4 sm:px-6 lg:px-8">
        <QuickRequestBar onSendRequest={handleQuickRequest} />
        <RequestTabs />
        <div className="mt-6">
          <ResponseViewer response={response} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
