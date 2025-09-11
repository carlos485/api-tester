import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type {
  ApiRequest,
  ApiResponse,
  Endpoint,
  Environment,
} from "../types/project";
import QuickRequestBar from "./QuickRequestBar";
import RequestTabs from "./RequestTabs";
import ResponseViewer from "./ResponseViewer";
import { Tabs, Tab } from "./Tabs";
import EnvironmentSelector from "./EnvironmentSelector";
import ProjectsSidebar from "./ProjectsSidebar";
import UserMenu from "./UserMenu";
import Input from "./Input";
import {
  saveRequestTabs,
  getRequestTabs,
  saveActiveTabIndex,
  getActiveTabIndex,
  saveSelectedEndpoint,
  getSelectedEndpoint,
  getSelectedEnvironment,
  clearSelectedEnvironment,
} from "../utils/sessionStorage";

interface RequestTab {
  id: string;
  name: string;
  request: ApiRequest;
  response: ApiResponse | null;
  loading: boolean;
  endpointId?: string;
  projectId?: string;
}

const ApiTesterView: React.FC = () => {
  // Initialize with default values, will be restored from sessionStorage in useEffect
  const [requestTabs, setRequestTabs] = useState<RequestTab[]>([
    {
      id: "tab-1",
      name: "New Request",
      request: { method: "GET", url: "", headers: {}, queryParams: {}, body: "" },
      response: null,
      loading: false,
    },
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>();
  const [isRestoredFromSession, setIsRestoredFromSession] = useState(false);
  const [shouldActivateLastTab, setShouldActivateLastTab] = useState(false);
  const [editingTabName, setEditingTabName] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);

  // Restore state from sessionStorage on component mount
  useEffect(() => {
    const savedTabs = getRequestTabs();
    const savedActiveIndex = getActiveTabIndex();
    const savedEndpointId = getSelectedEndpoint();
    const savedEnvironmentId = getSelectedEnvironment();

    if (savedTabs.length > 0) {
      // Convert SerializedRequestTab to RequestTab
      const convertedTabs = savedTabs.map(tab => ({
        ...tab,
        response: tab.response as ApiResponse | null
      }));
      setRequestTabs(convertedTabs);
      setActiveTabIndex(Math.min(savedActiveIndex, savedTabs.length - 1));
    }

    if (savedEndpointId) {
      setSelectedEndpointId(savedEndpointId);
    }

    if (savedEnvironmentId) {
      // We'll handle environment restoration when we have project context
      // For now, just clear it since we don't have project-specific environments
      clearSelectedEnvironment();
    }

    setIsRestoredFromSession(true);
  }, []);

  // Save state to sessionStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (isRestoredFromSession) {
      saveRequestTabs(requestTabs);
    }
  }, [requestTabs, isRestoredFromSession]);

  useEffect(() => {
    if (isRestoredFromSession) {
      saveActiveTabIndex(activeTabIndex);
    }
  }, [activeTabIndex, isRestoredFromSession]);

  useEffect(() => {
    if (isRestoredFromSession && selectedEndpointId) {
      saveSelectedEndpoint(selectedEndpointId);
    }
  }, [selectedEndpointId, isRestoredFromSession]);

  // Effect to activate the last tab when a new tab is added
  useEffect(() => {
    if (shouldActivateLastTab && requestTabs.length > 0) {
      setActiveTabIndex(requestTabs.length - 1);
      setShouldActivateLastTab(false);
    }
  }, [shouldActivateLastTab, requestTabs]);

  // Update selectedEndpointId when active tab changes
  useEffect(() => {
    const currentTab = requestTabs[activeTabIndex];
    if (currentTab?.endpointId) {
      setSelectedEndpointId(currentTab.endpointId);
    } else {
      setSelectedEndpointId(undefined);
    }
  }, [activeTabIndex, requestTabs]);

  const handleSendRequest = async (request: ApiRequest) => {
    const currentTab = requestTabs[activeTabIndex];
    if (!currentTab) return;

    // Update the current tab's loading state
    setRequestTabs(prev =>
      prev.map((tab, index) =>
        index === activeTabIndex ? { ...tab, loading: true, request } : tab
      )
    );

    const startTime = Date.now();

    try {
      // Construct base URL with environment base URL if selected
      let baseUrl = request.url;
      if (selectedEnvironment && baseUrl) {
        // If URL is relative, prepend with environment base URL
        if (baseUrl.startsWith('/')) {
          baseUrl = selectedEnvironment.baseUrl.replace(/\/$/, '') + baseUrl;
        }
        // If URL doesn't start with http, assume it's relative
        else if (!baseUrl.startsWith('http')) {
          baseUrl = selectedEnvironment.baseUrl.replace(/\/$/, '') + '/' + baseUrl;
        }
      }

      // Construct URL with query parameters
      let requestUrl = baseUrl;
      if (request.queryParams && Object.keys(request.queryParams).length > 0) {
        const url = new URL(requestUrl);
        Object.entries(request.queryParams).forEach(([key, value]) => {
          if (key.trim() && value.trim()) {
            url.searchParams.set(key.trim(), value.trim());
          }
        });
        requestUrl = url.toString();
      }

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

      console.log("Making request to:", requestUrl);
      console.log("Request options:", fetchOptions);

      const response = await fetch(requestUrl, fetchOptions);
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

      const responseData: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers,
        data,
        time: endTime - startTime,
      };

      // Update the current tab's response
      setRequestTabs(prev =>
        prev.map((tab, index) =>
          index === activeTabIndex
            ? { ...tab, response: responseData, loading: false }
            : tab
        )
      );
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

      const errorResponse: ApiResponse = {
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: {
          error: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString(),
        },
        time: endTime - startTime,
      };

      // Update the current tab's error response
      setRequestTabs(prev =>
        prev.map((tab, index) =>
          index === activeTabIndex
            ? { ...tab, response: errorResponse, loading: false }
            : tab
        )
      );
    }
  };

  const handleQuickRequest = (quickRequest: {
    method: string;
    url: string;
  }) => {
    const currentTab = requestTabs[activeTabIndex];
    if (!currentTab) return;

    const request: ApiRequest = {
      ...currentTab.request,
      method: quickRequest.method,
      url: quickRequest.url,
    };

    // Send the request
    handleSendRequest(request);
  };

  const handleQuickRequestChange = (
    tabIndex: number,
    quickRequest: {
      method: string;
      url: string;
    }
  ) => {
    const currentTab = requestTabs[tabIndex];
    if (!currentTab) return;

    const updatedRequest: ApiRequest = {
      ...currentTab.request,
      method: quickRequest.method,
      url: quickRequest.url,
    };

    // Update the tab's request state
    handleRequestChange(tabIndex, updatedRequest);
  };

  const handleEndpointSelect = (endpoint: Endpoint & { projectId: string }) => {
    setSelectedEndpointId(endpoint.id);

    // Check if a tab for this endpoint already exists
    const existingTabIndex = requestTabs.findIndex(
      tab => tab.endpointId === endpoint.id && tab.projectId === endpoint.projectId
    );

    if (existingTabIndex !== -1) {
      // Tab already exists, just activate it
      setActiveTabIndex(existingTabIndex);
    } else {
      // Check if there's only one tab that is empty and not associated with any endpoint
      const shouldReplaceEmptyTab = 
        requestTabs.length === 1 &&
        !requestTabs[0].endpointId &&
        !requestTabs[0].request.url &&
        !requestTabs[0].request.body &&
        Object.keys(requestTabs[0].request.headers).length === 0 &&
        Object.keys(requestTabs[0].request.queryParams).length === 0 &&
        !requestTabs[0].response;

      const newTab: RequestTab = {
        id: `endpoint-${endpoint.id}-${Date.now()}`,
        name: endpoint.name,
        request: {
          method: endpoint.method,
          url: endpoint.url,
          headers: endpoint.headers || {},
          queryParams: endpoint.queryParams || {},
          body: endpoint.body || "",
        },
        response: null,
        loading: false,
        endpointId: endpoint.id,
        projectId: endpoint.projectId,
      };

      if (shouldReplaceEmptyTab) {
        // Replace the empty tab
        setRequestTabs([newTab]);
        setActiveTabIndex(0);
      } else {
        // Create a new tab for this endpoint
        setRequestTabs(prev => [...prev, newTab]);
        setShouldActivateLastTab(true);
      }
    }
  };

  const handleAddTab = () => {
    const newTab: RequestTab = {
      id: `tab-${Date.now()}`,
      name: "New Request",
      request: { method: "GET", url: "", headers: {}, queryParams: {}, body: "" },
      response: null,
      loading: false,
    };

    setRequestTabs(prev => [...prev, newTab]);
    setShouldActivateLastTab(true);
  };

  const handleCloseTab = (indexToClose: number) => {
    if (requestTabs.length <= 1) return; // Don't close if it's the last tab

    // Calculate the new active index before filtering
    let newActiveIndex = activeTabIndex;

    if (indexToClose === activeTabIndex) {
      // If closing the active tab, decide which tab to activate next
      if (indexToClose === requestTabs.length - 1) {
        // Closing the last tab, move to the previous one
        newActiveIndex = indexToClose - 1;
      } else {
        // Closing a tab in the middle, keep the same index (next tab will shift to this position)
        newActiveIndex = indexToClose;
      }
    } else if (indexToClose < activeTabIndex) {
      // If closing a tab before the active tab, decrease the active index
      newActiveIndex = activeTabIndex - 1;
    }
    // If closing a tab after the active tab, no change needed (newActiveIndex stays the same)

    // Ensure the new index is valid for the filtered array
    const newTabsLength = requestTabs.length - 1;
    if (newActiveIndex >= newTabsLength) {
      newActiveIndex = newTabsLength - 1;
    }
    if (newActiveIndex < 0) {
      newActiveIndex = 0;
    }

    // Filter out the tab and update the active index
    setRequestTabs(prev => prev.filter((_, index) => index !== indexToClose));
    setActiveTabIndex(newActiveIndex);
  };

  const handleRequestChange = (
    tabIndex: number,
    updatedRequest: ApiRequest
  ) => {
    setRequestTabs(prev =>
      prev.map((tab, index) =>
        index === tabIndex ? { ...tab, request: updatedRequest } : tab
      )
    );
  };

  const handleTabNameChange = (tabIndex: number, newName: string) => {
    setRequestTabs(prev =>
      prev.map((tab, index) =>
        index === tabIndex ? { ...tab, name: newName } : tab
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">API Tester</h1>
              <EnvironmentSelector
                selectedEnvironment={selectedEnvironment}
                onEnvironmentChange={setSelectedEnvironment}
                environments={[]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="cursor-pointer p-2 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Icon icon="material-symbols:settings" />
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex gap-6 my-8">
            {/* Sidebar */}
            <ProjectsSidebar
              onEndpointSelect={handleEndpointSelect}
              selectedEndpointId={selectedEndpointId}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
              <Tabs
                defaultActiveTab={activeTabIndex}
                onAddTab={handleAddTab}
                onTabChange={setActiveTabIndex}
                onCloseTab={handleCloseTab}
                showCloseButton={requestTabs.length > 1}
              >
                {requestTabs.map((tab, tabIndex) => (
                  <Tab key={tab.id} header={tab.name}>
                    <div className="flex items-center gap-4">
                      <Input
                        type="text"
                        value={tab.name}
                        onChange={e =>
                          handleTabNameChange(tabIndex, e.target.value)
                        }
                        onFocus={() => setEditingTabName(tab.id)}
                        onBlur={() => setEditingTabName(null)}
                        className={`text-md text-gray-600 w-auto inline-block min-w-[120px] ${
                          editingTabName === tab.id
                            ? "border border-gray-300"
                            : "border-0 hover:border hover:border-gray-200"
                        }`}
                        style={{
                          width: `${Math.max(120, tab.name.length * 8 + 20)}px`,
                        }}
                      />
                    </div>
                    <QuickRequestBar
                      onSendRequest={handleQuickRequest}
                      environments={[]}
                      initialMethod={tab.request.method}
                      initialUrl={tab.request.url}
                      onRequestChange={quickRequest =>
                        handleQuickRequestChange(tabIndex, quickRequest)
                      }
                    />
                    <RequestTabs
                      request={tab.request}
                      onRequestChange={updatedRequest =>
                        handleRequestChange(tabIndex, updatedRequest)
                      }
                    />
                    <div className="mt-6">
                      <ResponseViewer
                        response={tab.response}
                        loading={tab.loading}
                      />
                    </div>
                  </Tab>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTesterView;