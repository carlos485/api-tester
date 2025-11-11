import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Project } from '@/features/projects/types';
import type { ApiRequest, ApiResponse } from '@/features/requests/types';
import type { Endpoint } from '@/features/endpoints/types';
import type { HttpMethod } from '@/shared/types';
import type { Environment } from '@/features/environments/types';
import { QuickRequestBar } from '@/features/requests/components';
import { RequestTabs } from '@/features/requests/components';
import { ResponseViewer } from '@/features/requests/components';
import { Tabs, Tab } from '@/shared/components/ui';
import { Sidebar } from '@/features/folders/components';
import { ProjectSelector } from '@/features/projects/components';
import { UserMenu } from '@/features/auth/components';
import { Input } from '@/shared/components/ui';
import { useEndpoints } from '@/features/endpoints/hooks';
import {
  saveRequestTabs,
  getRequestTabs,
  saveActiveTabIndex,
  getActiveTabIndex,
  saveSelectedEndpoint,
  getSelectedEndpoint,
  saveSelectedEnvironment,
  getSelectedEnvironment,
  clearRequestTabs,
  clearActiveTabIndex,
  clearSelectedEndpoint,
  clearSelectedEnvironment,
  interpolateVariables,
  interpolateObjectValues,
} from '@/shared/utils';

interface ProjectViewProps {
  project: Project;
  projects: Project[];
  onBackToHome: () => void;
  onProjectChange: (project: Project) => void;
}

interface RequestTab {
  id: string;
  name: string;
  request: ApiRequest;
  response: ApiResponse | null;
  loading: boolean;
  endpointId?: string; // ID of the original endpoint if this tab was created from one
}

const ProjectView: React.FC<ProjectViewProps> = ({
  project,
  projects,
  onBackToHome,
  onProjectChange,
}) => {
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
  const [savingTab, setSavingTab] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  // Use the endpoints hook for real Firebase data
  const {
    endpoints,
    loading: endpointsLoading,
    error: endpointsError,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
  } = useEndpoints(project.id);

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
        request: {
          ...tab.request,
          queryParams: tab.request.queryParams || {}
        },
        response: tab.response as ApiResponse | null
      }));
      setRequestTabs(convertedTabs);
      setActiveTabIndex(Math.min(savedActiveIndex, savedTabs.length - 1));
    }

    if (savedEndpointId) {
      setSelectedEndpointId(savedEndpointId);
    }

    if (savedEnvironmentId) {
      const environment = project.environments.find(env => env.id === savedEnvironmentId);
      if (environment) {
        setSelectedEnvironment(environment);
      }
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
      // If the current tab is not from an endpoint, clear selection
      setSelectedEndpointId(undefined);
    }
  }, [activeTabIndex, requestTabs]);

  // Save selected environment to sessionStorage when it changes
  useEffect(() => {
    const currentSavedId = getSelectedEnvironment();
    const newId = selectedEnvironment?.id || "";
    if (newId !== currentSavedId) {
      saveSelectedEnvironment(newId);
    }
  }, [selectedEnvironment]);

  const handleSendRequest = async (request: ApiRequest) => {
    const currentTab = requestTabs[activeTabIndex];
    if (!currentTab) return;

    // Keep the URL as-is in the tab state (this is what the input will show)
    setRequestTabs(prev =>
      prev.map((tab, index) =>
        index === activeTabIndex ? { ...tab, loading: true, request } : tab
      )
    );

    const startTime = Date.now();

    try {
      // Interpolate variables in URL, headers, query params, and body
      const globalVariables = project.collectionVariables || {};

      // Interpolate URL
      const interpolatedUrl = interpolateVariables(request.url, selectedEnvironment, globalVariables);

      // Construct full URL for making the HTTP request
      // This concatenation is ONLY for the request, NOT for updating state
      let baseUrl = interpolatedUrl;
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

      // Interpolate query parameters and construct URL
      let requestUrl = baseUrl;
      if (request.queryParams && Object.keys(request.queryParams).length > 0) {
        const interpolatedQueryParams = interpolateObjectValues(request.queryParams, selectedEnvironment, globalVariables);
        const url = new URL(requestUrl);
        Object.entries(interpolatedQueryParams).forEach(([key, value]) => {
          if (key.trim() && value.trim()) {
            url.searchParams.set(key.trim(), value.trim());
          }
        });
        requestUrl = url.toString();
      }

      // Interpolate headers
      const interpolatedHeaders = interpolateObjectValues(request.headers || {}, selectedEnvironment, globalVariables);

      const fetchOptions: RequestInit = {
        method: request.method,
        headers: interpolatedHeaders,
        mode: "cors",
      };

      // Interpolate body
      if (
        request.method !== "GET" &&
        request.method !== "HEAD" &&
        request.body
      ) {
        fetchOptions.body = interpolateVariables(request.body, selectedEnvironment, globalVariables);
      }

      // Use proxy for external URLs in development
      let finalUrl = requestUrl;
      const finalHeaders = { ...fetchOptions.headers };

      if (import.meta.env.DEV && requestUrl.startsWith('http')) {
        finalUrl = 'http://localhost:3001/proxy';
        finalHeaders['x-target-url'] = requestUrl;
      }

      console.log("Making request to:", finalUrl);
      console.log("Request options:", { ...fetchOptions, headers: finalHeaders });

      const response = await fetch(finalUrl, { ...fetchOptions, headers: finalHeaders });
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

  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpointId(endpoint.id);

    // Check if a tab for this endpoint already exists
    const existingTabIndex = requestTabs.findIndex(
      tab => tab.endpointId === endpoint.id
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
        endpointId: endpoint.id, // Store the endpoint ID
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

  const handleAddEndpoint = () => {
    // Create a new empty tab instead of saving to database
    const newTab: RequestTab = {
      id: `tab-${Date.now()}`,
      name: "New Request",
      request: { method: "GET", url: "", headers: {}, queryParams: {}, body: "" },
      response: null,
      loading: false,
      // No endpointId - this is a new unsaved request
    };

    setRequestTabs(prev => [...prev, newTab]);
    setShouldActivateLastTab(true);
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    try {
      await deleteEndpoint(endpointId);

      // Close any tabs that were using this deleted endpoint
      setRequestTabs(prev => {
        const filteredTabs = prev.filter(tab => tab.endpointId !== endpointId);

        // If we removed tabs and the active index is now invalid, adjust it
        if (filteredTabs.length > 0 && activeTabIndex >= filteredTabs.length) {
          setActiveTabIndex(filteredTabs.length - 1);
        } else if (filteredTabs.length === 0) {
          // If no tabs remain, create a default one
          const defaultTab: RequestTab = {
            id: `tab-${Date.now()}`,
            name: "New Request",
            request: { method: "GET", url: "", headers: {}, queryParams: {}, body: "" },
            response: null,
            loading: false,
          };
          setActiveTabIndex(0);
          return [defaultTab];
        }

        return filteredTabs;
      });

      console.log("Endpoint deleted successfully!");
    } catch (error) {
      console.error("Failed to delete endpoint:", error);
      // Here you could show a toast notification
    }
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

  const handleSaveEndpoint = async (tabIndex: number) => {
    const tab = requestTabs[tabIndex];
    if (!tab) return;

    setSavingTab(tab.id);

    try {
      const endpointData = {
        name: tab.name || "Untitled Request",
        method: tab.request.method as HttpMethod,
        url: tab.request.url || "",
        description: tab.endpointId
          ? `Updated from ${tab.name || "Untitled Request"}`
          : `Saved from ${tab.name || "Untitled Request"}`,
        headers: tab.request.headers,
        queryParams: tab.request.queryParams,
        body: tab.request.body,
      };

      if (tab.endpointId) {
        // Update existing endpoint
        await updateEndpoint(tab.endpointId, endpointData);
        console.log("Endpoint updated successfully!");
      } else {
        // Create new endpoint
        const newEndpointId = await createEndpoint(endpointData);

        // Update the tab to include the new endpoint ID
        setRequestTabs(prev =>
          prev.map((t, index) =>
            index === tabIndex ? { ...t, endpointId: newEndpointId } : t
          )
        );
        console.log("New endpoint created successfully!");
      }
    } catch (error) {
      console.error("Failed to save endpoint:", error);
      // TODO: Show error message/toast
    } finally {
      setSavingTab(null);
    }
  };

  // const currentTab = requestTabs[activeTabIndex];

  // Clean up session storage when going back to home
  const handleBackToHomeWithCleanup = () => {
    // Clear only ProjectView specific data, not the selected project
    clearRequestTabs();
    clearActiveTabIndex();
    clearSelectedEndpoint();
    clearSelectedEnvironment();
    onBackToHome();
  };

  // Handle sidebar resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0 h-14">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToHomeWithCleanup}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Back to projects"
            >
              <Icon icon="material-symbols:arrow-back" className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <ProjectSelector
              projects={projects}
              currentProject={project}
              onProjectChange={onProjectChange}
            />
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto relative"
          style={{ width: `${sidebarWidth}px` }}
        >
          <Sidebar
            endpoints={endpoints}
            onEndpointSelect={handleEndpointSelect}
            onAddEndpoint={handleAddEndpoint}
            onDeleteEndpoint={handleDeleteEndpoint}
            selectedEndpointId={selectedEndpointId}
            loading={endpointsLoading}
          />
          {/* Resize handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors ${isResizing ? 'bg-blue-500' : ''
              }`}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {endpointsError && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <Icon icon="material-symbols:error" className="h-4 w-4" />
                <span>Error loading endpoints: {endpointsError}</span>
              </div>
            </div>
          )}

          <Tabs
            defaultActiveTab={activeTabIndex}
            onAddTab={handleAddTab}
            onTabChange={setActiveTabIndex}
            onCloseTab={handleCloseTab}
            showCloseButton={requestTabs.length > 1}
          >
            {requestTabs.map((tab, tabIndex) => (
              <Tab key={tab.id} header={tab.name}>
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Request Name and Save Button */}
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <Input
                      type="text"
                      value={tab.name}
                      onChange={e =>
                        handleTabNameChange(tabIndex, e.target.value)
                      }
                      onFocus={() => setEditingTabName(tab.id)}
                      onBlur={() => setEditingTabName(null)}
                      className={`text-sm text-gray-700 dark:text-gray-300 flex-1 ${editingTabName === tab.id
                        ? "border border-gray-300 dark:border-gray-600"
                        : "border-0 hover:border hover:border-gray-200 dark:hover:border-gray-600"
                        }`}
                    />
                    <button
                      onClick={() => handleSaveEndpoint(tabIndex)}
                      disabled={savingTab === tab.id}
                      className={`p-1.5 transition-colors text-xl border-2 border-transparent focus:outline-none rounded focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${tab.endpointId
                        ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900"
                        : "text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                      title={tab.endpointId ? "Update endpoint" : "Save as new endpoint"}
                    >
                      <Icon icon={savingTab === tab.id ? "line-md:loading-loop" : "uil:save"} />
                    </button>
                  </div>

                  {/* Quick Request Bar */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <QuickRequestBar
                      onSendRequest={handleQuickRequest}
                      environments={project.environments}
                      selectedEnvironment={selectedEnvironment}
                      onEnvironmentChange={setSelectedEnvironment}
                      initialMethod={tab.request.method}
                      initialUrl={tab.request.url}
                      onRequestChange={quickRequest =>
                        handleQuickRequestChange(tabIndex, quickRequest)
                      }
                      onCurlParsed={parsedRequest =>
                        handleRequestChange(tabIndex, parsedRequest)
                      }
                    />
                  </div>

                  {/* Request Configuration Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <RequestTabs
                      request={tab.request}
                      onRequestChange={updatedRequest =>
                        handleRequestChange(tabIndex, updatedRequest)
                      }
                      availableVariables={selectedEnvironment?.variables || {}}
                    />
                  </div>

                  {/* Response Viewer */}
                  <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                    <ResponseViewer
                      response={tab.response}
                      loading={tab.loading}
                    />
                  </div>
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
