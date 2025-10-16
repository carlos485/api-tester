import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { ApiRequest, ApiResponse } from '@/features/requests/types';
import type { Endpoint } from '@/features/endpoints/types';
import type { Environment } from '@/features/environments/types';
import type { Project } from '@/features/projects/types';
import { QuickRequestBar } from '@/features/requests/components';
import { RequestTabs } from '@/features/requests/components';
import { ResponseViewer } from '@/features/requests/components';
import { Tabs, Tab } from '@/shared/components/ui';
import { ProjectsSidebar } from '@/features/projects/components';
import { UserMenu } from '@/features/auth/components';
import { Input } from '@/shared/components/ui';
import { ProjectDetails } from '@/features/projects/components';
import { useAuth } from '@/features/auth/hooks';
import { useProjects } from '@/features/projects/hooks';
import { ProjectSelectionModal } from '@/features/projects/components';
import {
  saveRequestTabs,
  saveAllTabs,
  getAllTabs,
  saveActiveTabIndex,
  getActiveTabIndex,
  saveSelectedEndpoint,
  getSelectedEndpoint,
  getSelectedEnvironment,
  clearSelectedEnvironment,
  interpolateVariables,
  interpolateObjectValues,
} from '@/shared/utils';

interface RequestTab {
  id: string;
  name: string;
  type: 'request';
  request: ApiRequest;
  response: ApiResponse | null;
  loading: boolean;
  endpointId?: string;
  projectId?: string;
  isTransient?: boolean; // Tab transitoria que puede ser reemplazada
}

interface ProjectTab {
  id: string;
  name: string;
  type: 'project';
  project: Project;
  isTransient?: boolean; // Tab transitoria que puede ser reemplazada
}

type Tab = RequestTab | ProjectTab;

const ApiTesterView: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects(user?.uid || null);

  // Initialize with default values, will be restored from sessionStorage in useEffect
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab-1",
      name: "New Request",
      type: 'request',
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
  const [selectedEnvironments, setSelectedEnvironments] = useState<Record<string, Environment | null>>({});
  const [savingTab, setSavingTab] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [pendingTabIndex, setPendingTabIndex] = useState<number | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  // Restore state from sessionStorage on component mount
  useEffect(() => {
    const savedAllTabs = getAllTabs();
    const savedActiveIndex = getActiveTabIndex();
    const savedEndpointId = getSelectedEndpoint();
    const savedEnvironmentId = getSelectedEnvironment();

    if (savedAllTabs.length > 0) {
      // Convert serialized tabs back to Tab objects
      // Note: Project tabs will need to be resolved with actual project data later
      const convertedTabs: Tab[] = savedAllTabs.map(tab => {
        if (tab.type === 'project') {
          return {
            id: tab.id,
            name: tab.name,
            type: 'project' as const,
            project: null as any, // Will be resolved later when projects are loaded
            projectId: tab.projectId,
            isTransient: tab.isTransient || false,
          };
        } else {
          return {
            id: tab.id,
            name: tab.name,
            type: 'request' as const,
            request: {
              ...tab.request,
              queryParams: tab.request.queryParams || {}
            },
            response: tab.response as ApiResponse | null,
            loading: false,
            endpointId: tab.endpointId,
            projectId: tab.projectId,
            isTransient: tab.isTransient || false,
          };
        }
      });
      setTabs(convertedTabs);
      setActiveTabIndex(Math.min(savedActiveIndex, savedAllTabs.length - 1));
    }

    if (savedEndpointId) {
      setSelectedEndpointId(savedEndpointId);
    }

    if (savedEnvironmentId) {
      clearSelectedEnvironment();
    }

    setIsRestoredFromSession(true);
  }, []);

  // Resolve project tabs when projects are loaded
  useEffect(() => {
    if (!projectsLoading && projects.length > 0 && isRestoredFromSession) {
      setTabs(prevTabs =>
        prevTabs.map(tab => {
          if (tab.type === 'project' && !tab.project) {
            const projectId = (tab as any).projectId;
            const project = projects.find(p => p.id === projectId);
            if (project) {
              return {
                ...tab,
                project,
                name: project.name,
              };
            }
          }
          return tab;
        })
      );
    }
  }, [projects, projectsLoading, isRestoredFromSession]);

  // Save state to sessionStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (isRestoredFromSession) {
      // Save all tabs (request and project) to session storage
      const serializedTabs = tabs.map(tab => {
        if (tab.type === 'project') {
          return {
            id: tab.id,
            name: tab.name,
            type: 'project' as const,
            projectId: tab.project?.id || (tab as any).projectId, // Handle case where project might not be loaded yet
            isTransient: tab.isTransient || false,
          };
        } else {
          return {
            id: tab.id,
            name: tab.name,
            type: 'request' as const,
            request: tab.request,
            response: tab.response,
            loading: false,
            endpointId: tab.endpointId,
            projectId: tab.projectId,
            isTransient: tab.isTransient || false,
          };
        }
      });
      saveAllTabs(serializedTabs);

      // Also save request tabs for backward compatibility
      const requestTabsOnly = tabs.filter(tab => tab.type === 'request') as RequestTab[];
      saveRequestTabs(requestTabsOnly);
    }
  }, [tabs, isRestoredFromSession]);

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
    if (shouldActivateLastTab && tabs.length > 0) {
      setActiveTabIndex(tabs.length - 1);
      setShouldActivateLastTab(false);
    }
  }, [shouldActivateLastTab, tabs]);

  // Update selectedEndpointId when active tab changes
  useEffect(() => {
    const currentTab = tabs[activeTabIndex];
    if (currentTab?.type === 'request' && currentTab.endpointId) {
      setSelectedEndpointId(currentTab.endpointId);
    } else {
      setSelectedEndpointId(undefined);
    }
  }, [activeTabIndex, tabs]);

  // Helper function to find transient tab index
  const findTransientTabIndex = () => {
    return tabs.findIndex(tab => tab.isTransient === true);
  };

  // Helper function to replace transient tab or add new tab
  const addOrReplaceTab = (newTab: Tab) => {
    const transientIndex = findTransientTabIndex();
    
    if (transientIndex !== -1) {
      // Replace the transient tab
      setTabs(prev => 
        prev.map((tab, index) => index === transientIndex ? newTab : tab)
      );
      setActiveTabIndex(transientIndex);
    } else {
      // Add new tab
      setTabs(prev => [...prev, newTab]);
      setShouldActivateLastTab(true);
    }
  };

  // Function to confirm a tab (make it permanent)
  const confirmTab = (tabIndex: number) => {
    setTabs(prev =>
      prev.map((tab, index) =>
        index === tabIndex ? { ...tab, isTransient: false } : tab
      )
    );
  };

  const handleSendRequest = async (request: ApiRequest) => {
    const currentTab = tabs[activeTabIndex];
    if (!currentTab || currentTab.type !== 'request') return;

    // Update the current tab's loading state
    setTabs(prev =>
      prev.map((tab, index) =>
        index === activeTabIndex && tab.type === 'request'
          ? { ...tab, loading: true, request }
          : tab
      )
    );

    const startTime = Date.now();

    try {
      // Get the selected environment for the current tab
      const tabEnvironment = selectedEnvironments[currentTab.id];

      // Get global variables from the project (if tab has projectId)
      const currentProject = currentTab.projectId
        ? projects.find(p => p.id === currentTab.projectId)
        : null;
      const globalVariables = currentProject?.collectionVariables || {};

      // Interpolate variables in URL, headers, query params, and body
      let interpolatedUrl = interpolateVariables(request.url, tabEnvironment, globalVariables);

      // Construct base URL with environment base URL if selected
      let baseUrl = interpolatedUrl;
      if (tabEnvironment && baseUrl) {
        // If URL is relative, prepend with environment base URL
        if (baseUrl.startsWith('/')) {
          baseUrl = tabEnvironment.baseUrl.replace(/\/$/, '') + baseUrl;
        }
        // If URL doesn't start with http, assume it's relative
        else if (!baseUrl.startsWith('http')) {
          baseUrl = tabEnvironment.baseUrl.replace(/\/$/, '') + '/' + baseUrl;
        }
      }

      // Interpolate query parameters and construct URL
      let requestUrl = baseUrl;
      if (request.queryParams && Object.keys(request.queryParams).length > 0) {
        const interpolatedQueryParams = interpolateObjectValues(request.queryParams, tabEnvironment, globalVariables);
        const url = new URL(requestUrl);
        Object.entries(interpolatedQueryParams).forEach(([key, value]) => {
          if (key.trim() && value.trim()) {
            url.searchParams.set(key.trim(), value.trim());
          }
        });
        requestUrl = url.toString();
      }

      // Interpolate headers
      const interpolatedHeaders = interpolateObjectValues(request.headers || {}, tabEnvironment, globalVariables);

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
        fetchOptions.body = interpolateVariables(request.body, tabEnvironment, globalVariables);
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
      setTabs(prev =>
        prev.map((tab, index) =>
          index === activeTabIndex && tab.type === 'request'
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
      setTabs(prev =>
        prev.map((tab, index) =>
          index === activeTabIndex && tab.type === 'request'
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
    const currentTab = tabs[activeTabIndex];
    if (!currentTab || currentTab.type !== 'request') return;

    const request: ApiRequest = {
      ...currentTab.request,
      method: quickRequest.method,
      url: quickRequest.url,
    };

    // Send the request
    handleSendRequest(request);
  };

  const handleProjectSelect = (project: Project) => {
    // Check if a tab for this project already exists
    const existingTabIndex = tabs.findIndex(
      tab => tab.type === 'project' && tab.project.id === project.id
    );

    if (existingTabIndex !== -1) {
      // Tab already exists, just activate it
      setActiveTabIndex(existingTabIndex);
    } else {
      // Create a new transient tab for this project
      const newTab: ProjectTab = {
        id: `project-${project.id}-${Date.now()}`,
        name: project.name,
        type: 'project',
        project: project,
        isTransient: true, // Nueva tab es transitoria
      };

      addOrReplaceTab(newTab);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    // Update the project in any existing tabs
    setTabs(prev =>
      prev.map(tab =>
        tab.type === 'project' && tab.project.id === updatedProject.id
          ? { ...tab, project: updatedProject, name: updatedProject.name }
          : tab
      )
    );
  };

  const handleProjectDelete = (projectId: string) => {
    // Remove all tabs related to the deleted project
    setTabs(prev => {
      const filteredTabs = prev.filter(tab => {
        if (tab.type === 'project') {
          return tab.project.id !== projectId;
        } else if (tab.type === 'request') {
          return tab.projectId !== projectId;
        }
        return true;
      });

      // If no tabs remain, create a default one
      if (filteredTabs.length === 0) {
        const defaultTab: RequestTab = {
          id: `tab-${Date.now()}`,
          name: "New Request",
          type: 'request',
          request: { method: "GET", url: "", headers: {}, queryParams: {}, body: "" },
          response: null,
          loading: false,
        };
        setActiveTabIndex(0);
        return [defaultTab];
      }

      // Adjust active tab index if necessary
      if (activeTabIndex >= filteredTabs.length) {
        setActiveTabIndex(filteredTabs.length - 1);
      }

      return filteredTabs;
    });
  };

  const handleSaveEndpoint = async (tabIndex: number) => {
    const tab = tabs[tabIndex];
    if (!tab || tab.type !== 'request') return;

    // If tab has endpointId, update it directly
    if (tab.endpointId) {
      await saveEndpointToProject(tabIndex, tab.projectId || projects[0]?.id);
      return;
    }

    // If tab doesn't have projectId, show project selection modal
    if (!tab.projectId) {
      setPendingTabIndex(tabIndex);
      setShowProjectModal(true);
      return;
    }

    // Save to existing project
    await saveEndpointToProject(tabIndex, tab.projectId);
  };

  const saveEndpointToProject = async (tabIndex: number, projectId: string) => {
    const tab = tabs[tabIndex];
    if (!tab || tab.type !== 'request') return;

    setSavingTab(tab.id);

    try {
      const { EndpointsService } = await import("@/features/endpoints/services");

      const endpointData = {
        projectId: projectId,
        name: tab.name || "Untitled Request",
        method: tab.request.method as any,
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
        await EndpointsService.updateEndpoint(tab.endpointId, endpointData);
        console.log("Endpoint updated successfully!");
      } else {
        // Create new endpoint
        const newEndpointId = await EndpointsService.createEndpoint(endpointData, projectId);

        // Update the tab to include the new endpoint ID and project ID
        setTabs(prev =>
          prev.map((t, index) =>
            index === tabIndex ? {
              ...t,
              endpointId: newEndpointId,
              projectId: projectId,
              isTransient: false
            } : t
          )
        );
        console.log("New endpoint created successfully!");
      }
    } catch (error) {
      console.error("Failed to save endpoint:", error);
      alert("Failed to save endpoint. Please try again.");
    } finally {
      setSavingTab(null);
    }
  };

  const handleProjectSelectForEndpoint = async (projectId: string) => {
    if (pendingTabIndex !== null) {
      await saveEndpointToProject(pendingTabIndex, projectId);
      setPendingTabIndex(null);
    }
    setShowProjectModal(false);
  };

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    icon: string;
  }) => {
    setIsCreatingProject(true);

    try {
      const { ProjectService } = await import("@/features/projects/services");
      const fullProjectData = {
        ...projectData,
        environments: [
          {
            id: "env-" + Date.now(),
            name: "Development",
            baseUrl: "http://localhost:3000",
            variables: {}
          }
        ],
        collectionVariables: {}
      };

      await ProjectService.createProject(fullProjectData, user?.uid || "");

      // Wait for projects to reload, then find the new project and save endpoint
      setTimeout(async () => {
        const newProject = projects.find(p => p.name === projectData.name);
        if (newProject && pendingTabIndex !== null) {
          await saveEndpointToProject(pendingTabIndex, newProject.id);
          setPendingTabIndex(null);
        }
        setShowProjectModal(false);
        setIsCreatingProject(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
      setIsCreatingProject(false);
    }
  };

  const handleQuickRequestChange = (
    tabIndex: number,
    quickRequest: {
      method: string;
      url: string;
    }
  ) => {
    const currentTab = tabs[tabIndex];
    if (!currentTab || currentTab.type !== 'request') return;

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
    const existingTabIndex = tabs.findIndex(
      tab => tab.type === 'request' && tab.endpointId === endpoint.id && tab.projectId === endpoint.projectId
    );

    if (existingTabIndex !== -1) {
      // Tab already exists, just activate it
      setActiveTabIndex(existingTabIndex);
    } else {
      // Check if there's only one tab that is empty and not associated with any endpoint
      const shouldReplaceEmptyTab = 
        tabs.length === 1 &&
        tabs[0].type === 'request' &&
        !tabs[0].endpointId &&
        !tabs[0].request.url &&
        !tabs[0].request.body &&
        Object.keys(tabs[0].request.headers).length === 0 &&
        Object.keys(tabs[0].request.queryParams).length === 0 &&
        !tabs[0].response;

      const newTab: RequestTab = {
        id: `endpoint-${endpoint.id}-${Date.now()}`,
        name: endpoint.name,
        type: 'request',
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
        isTransient: true, // Nueva tab es transitoria
      };

      if (shouldReplaceEmptyTab) {
        // Replace the empty tab
        setTabs([newTab]);
        setActiveTabIndex(0);
      } else {
        // Use the new system for transient tabs
        addOrReplaceTab(newTab);
      }
    }
  };

  const handleAddTab = () => {
    const newTab: RequestTab = {
      id: `tab-${Date.now()}`,
      name: "New Request",
      type: 'request',
      request: { method: "GET", url: "", headers: {}, queryParams: {}, body: "" },
      response: null,
      loading: false,
    };

    setTabs(prev => [...prev, newTab]);
    setShouldActivateLastTab(true);
  };

  const handleCloseTab = (indexToClose: number) => {
    if (tabs.length <= 1) return; // Don't close if it's the last tab

    // Calculate the new active index before filtering
    let newActiveIndex = activeTabIndex;

    if (indexToClose === activeTabIndex) {
      // If closing the active tab, decide which tab to activate next
      if (indexToClose === tabs.length - 1) {
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
    const newTabsLength = tabs.length - 1;
    if (newActiveIndex >= newTabsLength) {
      newActiveIndex = newTabsLength - 1;
    }
    if (newActiveIndex < 0) {
      newActiveIndex = 0;
    }

    // Filter out the tab and update the active index
    setTabs(prev => prev.filter((_, index) => index !== indexToClose));
    setActiveTabIndex(newActiveIndex);
  };

  const handleRequestChange = (
    tabIndex: number,
    updatedRequest: ApiRequest
  ) => {
    // Confirm the tab when changes are made
    confirmTab(tabIndex);
    
    setTabs(prev =>
      prev.map((tab, index) =>
        index === tabIndex && tab.type === 'request' 
          ? { ...tab, request: updatedRequest, isTransient: false } 
          : tab
      )
    );
  };

  const handleTabNameChange = (tabIndex: number, newName: string) => {
    // Confirm the tab when name is changed
    confirmTab(tabIndex);
    
    setTabs(prev =>
      prev.map((tab, index) =>
        index === tabIndex ? { ...tab, name: newName, isTransient: false } : tab
      )
    );
  };

  // Handle double click on tab header to confirm it
  const handleTabDoubleClick = (tabIndex: number) => {
    confirmTab(tabIndex);
  };

  // Get project for current tab
  const getCurrentTabProject = (): Project | null => {
    const currentTab = tabs[activeTabIndex];
    if (!currentTab) return null;

    if (currentTab.type === 'project') {
      return currentTab.project;
    } else if (currentTab.type === 'request' && currentTab.projectId) {
      return projects.find(p => p.id === currentTab.projectId) || null;
    }

    return null;
  };

  // Get environments for current tab
  const getCurrentTabEnvironments = (): Environment[] => {
    const project = getCurrentTabProject();
    return project?.environments || [];
  };

  // Handle environment change for a specific tab
  const handleEnvironmentChange = (tabId: string, environment: Environment | null) => {
    setSelectedEnvironments(prev => ({
      ...prev,
      [tabId]: environment
    }));
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-90 dark:border-gray-700 flex-shrink-0 h-14">
        <div className="h-full px-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">API Tester</h1>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 overflow-y-auto relative"
          style={{ width: `${sidebarWidth}px` }}
        >
          <ProjectsSidebar
            onEndpointSelect={handleEndpointSelect}
            onProjectSelect={handleProjectSelect}
            selectedEndpointId={selectedEndpointId}
            onEndpointCreate={handleEndpointSelect}
          />
          {/* Resize handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors ${
              isResizing ? 'bg-blue-500' : ''
            }`}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            defaultActiveTab={activeTabIndex}
            onAddTab={handleAddTab}
            onTabChange={setActiveTabIndex}
            onCloseTab={handleCloseTab}
            onTabDoubleClick={handleTabDoubleClick}
            showCloseButton={tabs.length > 1}
          >
            {tabs.map((tab, tabIndex) => {
              // Create custom header with icon/method indicator
              const getMethodColor = (method: string) => {
                switch (method.toUpperCase()) {
                  case "GET":
                    return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900";
                  case "POST":
                    return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900";
                  case "PUT":
                    return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900";
                  case "DELETE":
                    return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900";
                  case "PATCH":
                    return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900";
                  default:
                    return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700";
                }
              };

              const tabHeader = tab.type === 'request' ? (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getMethodColor(tab.request.method)} min-w-[45px] text-center`}>
                    {tab.request.method}
                  </span>
                  <span>{tab.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon icon="bi:collection" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span>{tab.name}</span>
                </div>
              );

              return (
                <Tab key={tab.id} header={tabHeader} isTransient={tab.isTransient}>
                  {tab.type === 'request' ? (
                    <div className="flex flex-col h-full overflow-hidden">
                      {/* Request Name and Save Button */}
                      <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800">
                        <Input
                          type="text"
                          value={tab.name}
                          onChange={e =>
                            handleTabNameChange(tabIndex, e.target.value)
                          }
                          onFocus={() => setEditingTabName(tab.id)}
                          onBlur={() => setEditingTabName(null)}
                          className={`text-sm text-gray-700 dark:text-gray-300 flex-1 ${
                            editingTabName === tab.id
                              ? "border border-gray-300 dark:border-gray-600"
                              : "border-transparent hover:border hover:border-gray-200 dark:hover:border-gray-600"
                          }`}
                        />
                        <button
                          onClick={() => handleSaveEndpoint(tabIndex)}
                          disabled={savingTab === tab.id}
                          className={`p-1.5 transition-colors text-xl border-2 border-transparent focus:outline-none rounded focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            tab.endpointId
                              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900"
                              : "text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                          title={tab.endpointId ? "Update endpoint" : "Save as new endpoint"}
                        >
                          <Icon icon={savingTab === tab.id ? "line-md:loading-loop" : "uil:save"} />
                        </button>
                      </div>

                      {/* Quick Request Bar */}
                      <div className="px-4 py-3 bg-white dark:bg-gray-800">
                        <QuickRequestBar
                          onSendRequest={handleQuickRequest}
                          environments={getCurrentTabEnvironments()}
                          selectedEnvironment={selectedEnvironments[tab.id] || null}
                          onEnvironmentChange={(env) => handleEnvironmentChange(tab.id, env)}
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
                      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <RequestTabs
                          request={tab.request}
                          onRequestChange={updatedRequest =>
                            handleRequestChange(tabIndex, updatedRequest)
                          }
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
                  ) : (
                    /* Project Tab Content */
                    <div className="h-full overflow-auto">
                      <ProjectDetails
                        project={tab.project}
                        onProjectUpdate={handleProjectUpdate}
                        onProjectDelete={handleProjectDelete}
                      />
                    </div>
                  )}
                </Tab>
              );
            })}
          </Tabs>
        </div>
      </div>

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        isOpen={showProjectModal}
        projects={projects}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectSelectForEndpoint}
        onCreateProject={handleCreateProject}
        isCreating={isCreatingProject}
      />
    </div>
  );
};

export default ApiTesterView;