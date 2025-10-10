import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Project } from '@/features/projects/types';
import type { Endpoint, EndpointFolder } from '@/features/endpoints/types';
import { useAuth } from '@/features/auth/hooks';
import { useProjects } from '@/features/projects/hooks';
import { CreateProjectModal } from '@/features/projects/components';
import { ConfirmationModal } from '@/shared/components/ui';

interface ProjectsSidebarProps {
  onEndpointSelect: (endpoint: Endpoint & { projectId: string }) => void;
  onProjectSelect: (project: Project) => void;
  selectedEndpointId?: string;
  onEndpointCreate?: (endpoint: Endpoint & { projectId: string }) => void;
}

interface ProjectNode {
  id: string;
  name: string;
  type: "project";
  expanded: boolean;
  folders: FolderNode[];
  endpoints: (Endpoint & { projectId: string })[]; // Endpoints not in any folder
}

interface FolderNode {
  id: string;
  name: string;
  type: "folder";
  expanded: boolean;
  parentId?: string;
  endpoints: (Endpoint & { projectId: string })[];
  subfolders: FolderNode[];
}

const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({
  onEndpointSelect,
  onProjectSelect,
  selectedEndpointId,
  onEndpointCreate,
}) => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects(user?.uid || null);
  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([]);
  const [projectEndpoints, setProjectEndpoints] = useState<Record<string, { endpoints: Endpoint[], folders: EndpointFolder[] }>>({});
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  const [hoveredEndpointId, setHoveredEndpointId] = useState<string | null>(null);
  const [showEndpointMenu, setShowEndpointMenu] = useState<string | null>(null);
  const [endpointToDelete, setEndpointToDelete] = useState<(Endpoint & { projectId: string }) | null>(null);
  const [isDeletingEndpoint, setIsDeletingEndpoint] = useState(false);
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);


  // Function to organize endpoints and folders
  const organizeProjectData = (
    projectId: string,
    endpoints: Endpoint[],
    folders: EndpointFolder[] = []
  ) => {
    // Group endpoints by folder
    const endpointsByFolder = endpoints.reduce((acc, endpoint) => {
      const folderId = endpoint.folder || "root";
      if (!acc[folderId]) {
        acc[folderId] = [];
      }
      acc[folderId].push({ ...endpoint, projectId });
      return acc;
    }, {} as Record<string, (Endpoint & { projectId: string })[]>);

    // Build folder structure (supporting nested folders)
    const buildFolderTree = (parentId?: string): FolderNode[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          id: folder.id,
          name: folder.name,
          type: "folder" as const,
          expanded: true,
          parentId: folder.parentId,
          endpoints: endpointsByFolder[folder.id] || [],
          subfolders: buildFolderTree(folder.id),
        }));
    };

    return {
      folders: buildFolderTree(),
      endpoints: endpointsByFolder["root"] || [], // Endpoints not in any folder
    };
  };

  // Load endpoints and folders for each project
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      const loadProjectData = async () => {
        setLoadingEndpoints(true);

        try {
          const { EndpointsService } = await import("@/features/endpoints/services");
          const projectData: Record<string, { endpoints: Endpoint[], folders: EndpointFolder[] }> = {};

          for (const project of projects) {
            try {
              const [endpoints, folders] = await Promise.all([
                EndpointsService.getEndpoints(project.id),
                EndpointsService.getEndpointFolders(project.id)
              ]);
              projectData[project.id] = { endpoints, folders };
              console.log(`Loaded ${endpoints.length} endpoints for project ${project.name}`);
            } catch (error) {
              console.error(`Error loading data for project ${project.id}:`, error);
              projectData[project.id] = { endpoints: [], folders: [] };
            }
          }

          setProjectEndpoints(projectData);
          setLoadingEndpoints(false);
        } catch (error) {
          console.error('Error in loadProjectData:', error);
          setLoadingEndpoints(false);
        }
      };

      loadProjectData();
    }
  }, [projects, projectsLoading]);

  // Create project nodes from projects and their data
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      const nodes: ProjectNode[] = projects.map(project => {
        const projectData = projectEndpoints[project.id] || { endpoints: [], folders: [] };
        const { folders, endpoints } = organizeProjectData(
          project.id,
          projectData.endpoints,
          projectData.folders
        );

        return {
          id: project.id,
          name: project.name,
          type: "project" as const,
          expanded: true,
          folders,
          endpoints,
        };
      });

      setProjectNodes(nodes);
    }
  }, [projects, projectsLoading, projectEndpoints]);

  const toggleProjectExpansion = (projectId: string) => {
    setProjectNodes(prev =>
      prev.map(node =>
        node.id === projectId ? { ...node, expanded: !node.expanded } : node
      )
    );
  };

  const handleProjectClick = (projectId: string) => {
    // Abrir el proyecto en una tab
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(project);
    }
    
    // También expandir/colapsar el proyecto
    toggleProjectExpansion(projectId);
  };

  const toggleFolderExpansion = (projectId: string, folderId: string) => {
    const toggleFolderInTree = (folders: FolderNode[]): FolderNode[] => {
      return folders.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, expanded: !folder.expanded };
        }
        if (folder.subfolders.length > 0) {
          return {
            ...folder,
            subfolders: toggleFolderInTree(folder.subfolders),
          };
        }
        return folder;
      });
    };

    setProjectNodes(prev =>
      prev.map(node =>
        node.id === projectId
          ? { ...node, folders: toggleFolderInTree(node.folders) }
          : node
      )
    );
  };

  const handleCreateProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { ProjectService } = await import("../services/projectService");
      await ProjectService.createProject(projectData, user?.uid || "");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteEndpoint = async () => {
    if (!endpointToDelete) return;

    setIsDeletingEndpoint(true);
    try {
      const { EndpointsService } = await import("@/features/endpoints/services");
      await EndpointsService.deleteEndpoint(endpointToDelete.id);

      // Update local state to remove the deleted endpoint
      setProjectEndpoints(prev => {
        const projectData = prev[endpointToDelete.projectId];
        if (!projectData) return prev;

        return {
          ...prev,
          [endpointToDelete.projectId]: {
            ...projectData,
            endpoints: projectData.endpoints.filter(e => e.id !== endpointToDelete.id)
          }
        };
      });

      setEndpointToDelete(null);
    } catch (error) {
      console.error("Error deleting endpoint:", error);
    } finally {
      setIsDeletingEndpoint(false);
    }
  };

  const handleAddEndpoint = async (projectId: string) => {
    setIsCreatingEndpoint(true);
    setShowProjectMenu(null);

    try {
      const { EndpointsService } = await import("@/features/endpoints/services");

      // Create a new endpoint with default values
      const newEndpointData: Omit<Endpoint, "id" | "createdAt" | "updatedAt"> = {
        projectId,
        name: "New Request",
        method: "GET",
        url: "",
        headers: {},
        queryParams: {},
        body: "",
      };

      const endpointId = await EndpointsService.createEndpoint(newEndpointData, projectId);

      // Create the full endpoint object to update local state and open in tab
      const newEndpoint: Endpoint & { projectId: string } = {
        ...newEndpointData,
        id: endpointId,
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId,
      };

      // Update local state to include the new endpoint
      setProjectEndpoints(prev => {
        const projectData = prev[projectId] || { endpoints: [], folders: [] };
        return {
          ...prev,
          [projectId]: {
            ...projectData,
            endpoints: [newEndpoint, ...projectData.endpoints]
          }
        };
      });

      // Open the new endpoint in a tab if callback is provided
      if (onEndpointCreate) {
        onEndpointCreate(newEndpoint);
      }
    } catch (error) {
      console.error("Error creating endpoint:", error);
    } finally {
      setIsCreatingEndpoint(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-green-600";
      case "POST":
        return "text-blue-600";
      case "PUT":
        return "text-orange-600";
      case "DELETE":
        return "text-red-600";
      case "PATCH":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  // Recursive component to render folders and their contents
  const renderFolders = (
    folders: FolderNode[],
    projectId: string,
    depth: number = 1
  ) => {
    return folders.map(folder => (
      <div key={folder.id} style={{ marginLeft: `${depth * 16}px` }}>
        {/* Folder Header */}
        <div
          className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded cursor-pointer"
          onClick={() => toggleFolderExpansion(projectId, folder.id)}
        >
          <Icon
            icon={
              folder.expanded
                ? "material-symbols:expand-more"
                : "material-symbols:chevron-right"
            }
            className="h-4 w-4 text-gray-500"
          />
          <Icon icon="line-md:folder" className="h-4 w-4 text-gray-900" />
          <span className="text-sm text-gray-700 truncate">{folder.name}</span>
        </div>

        {/* Folder Contents */}
        {folder.expanded && (
          <div>
            {/* Subfolder */}
            {folder.subfolders.length > 0 &&
              renderFolders(folder.subfolders, projectId, depth + 1)}

            {/* Folder Endpoints */}
            {folder.endpoints.map(endpoint => (
              <div
                key={`${endpoint.projectId}-${endpoint.id}`}
                className={`flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer group relative ${
                  selectedEndpointId === endpoint.id
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : ""
                }`}
                onClick={() => onEndpointSelect(endpoint)}
                onMouseEnter={() => setHoveredEndpointId(endpoint.id)}
                onMouseLeave={() => {
                  setHoveredEndpointId(null);
                  setShowEndpointMenu(null);
                }}
                style={{ marginLeft: `${(depth + 1) * 16}px` }}
              >
                <div className="w-4" /> {/* Spacer for alignment */}
                <span
                  className={`text-xs font-semibold ${getMethodColor(
                    endpoint.method
                  )} min-w-[42px]`}
                >
                  {endpoint.method}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  {endpoint.name}
                </span>

                {/* Options Menu Button - Always rendered but invisible when not hovered */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEndpointMenu(showEndpointMenu === endpoint.id ? null : endpoint.id);
                    }}
                    className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity ${
                      hoveredEndpointId === endpoint.id ? 'opacity-100' : 'opacity-0'
                    }`}
                    title="Options"
                  >
                    <Icon icon="material-symbols:more-vert" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showEndpointMenu === endpoint.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Rename endpoint", endpoint.name);
                          setShowEndpointMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      >
                        <Icon icon="mynaui:pencil" className="h-4 w-4" />
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Duplicate endpoint", endpoint.name);
                          setShowEndpointMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Icon icon="humbleicons:duplicate" className="h-4 w-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEndpointToDelete(endpoint);
                          setShowEndpointMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                      >
                        <Icon icon="iconamoon:trash" className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  if (projectsLoading || loadingEndpoints) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <p className="ml-2 text-sm text-gray-600">
            {projectsLoading ? "Loading projects..." : "Loading endpoints..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-90">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Icon
            icon="material-symbols:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            title="New Collection"
          >
            <Icon icon="material-symbols:add" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Project Tree */}
      <div className="flex-1 overflow-auto p-2">
        {projectNodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon
              icon="material-symbols:folder-outline"
              className="h-8 w-8 mx-auto mb-2"
            />
            <p className="text-sm">
              {projects.length === 0 ? "No collections yet" : "Loading endpoints..."}
            </p>
            {projects.length > 0 && (
              <p className="text-xs mt-1 text-gray-400">
                Found {projects.length} project(s)
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {projectNodes.map(project => (
              <div key={project.id}>
                {/* Project Node */}
                <div
                  className="flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer group relative"
                  onClick={() => handleProjectClick(project.id)}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => {
                    setHoveredProjectId(null);
                    setShowProjectMenu(null);
                  }}
                >
                  <Icon
                    icon={
                      project.expanded
                        ? "material-symbols:expand-more"
                        : "material-symbols:chevron-right"
                    }
                    className="h-4 w-4 text-gray-500 dark:text-gray-400"
                  />
                  <Icon
                    icon={
                      projects.find(p => p.id === project.id)?.icon ||
                      "material-symbols:folder"
                    }
                    className="h-4 w-4 text-gray-900 dark:text-gray-200"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate flex-1">
                    {project.name}
                  </span>

                  {/* Options Menu Button - Always rendered but invisible when not hovered */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProjectMenu(showProjectMenu === project.id ? null : project.id);
                      }}
                      className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity ${
                        hoveredProjectId === project.id ? 'opacity-100' : 'opacity-0'
                      }`}
                      title="Options"
                    >
                      <Icon icon="material-symbols:more-vert" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {showProjectMenu === project.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddEndpoint(project.id);
                          }}
                          disabled={isCreatingEndpoint}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingEndpoint ? (
                            <Icon icon="line-md:loading-loop" className="h-4 w-4" />
                          ) : (
                            <Icon icon="tabler:plus" className="h-4 w-4" />
                          )}
                          Add Endpoint
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Add folder to", project.name);
                            setShowProjectMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                        >
                          <Icon icon="mdi:folder-plus-outline" className="h-4 w-4" />
                          Add Folder
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Contents */}
                {project.expanded && (
                  <div className="ml-2 space-y-1">
                    {/* Folders (using recursive rendering) */}
                    {renderFolders(project.folders, project.id)}

                    {/* Direct Project Endpoints (not in any folder) */}
                    {project.endpoints.map(endpoint => (
                      <div
                        key={`${endpoint.projectId}-${endpoint.id}`}
                        className={`flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer group relative ${
                          selectedEndpointId === endpoint.id
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : ""
                        }`}
                        onClick={() => onEndpointSelect(endpoint)}
                        onMouseEnter={() => setHoveredEndpointId(endpoint.id)}
                        onMouseLeave={() => {
                          setHoveredEndpointId(null);
                          setShowEndpointMenu(null);
                        }}
                      >
                        <div className="w-4" /> {/* Spacer for alignment */}
                        <span
                          className={`text-xs font-semibold ${getMethodColor(
                            endpoint.method
                          )} mr-2`}
                        >
                          {endpoint.method}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                          {endpoint.name}
                        </span>

                        {/* Options Menu Button - Always rendered but invisible when not hovered */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEndpointMenu(showEndpointMenu === endpoint.id ? null : endpoint.id);
                            }}
                            className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity ${
                              hoveredEndpointId === endpoint.id ? 'opacity-100' : 'opacity-0'
                            }`}
                            title="Options"
                          >
                            <Icon icon="material-symbols:more-vert" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {showEndpointMenu === endpoint.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Rename endpoint", endpoint.name);
                                  setShowEndpointMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                              >
                                <Icon icon="mynaui:pencil" className="h-4 w-4" />
                                Rename
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Duplicate endpoint", endpoint.name);
                                  setShowEndpointMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Icon icon="humbleicons:duplicate" className="h-4 w-4" />
                                Duplicate
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEndpointToDelete(endpoint);
                                  setShowEndpointMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                              >
                                <Icon icon="iconamoon:trash" className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreate={handleCreateProject}
      />

      {/* Delete Endpoint Confirmation Modal */}
      <ConfirmationModal
        isOpen={endpointToDelete !== null}
        onClose={() => setEndpointToDelete(null)}
        onConfirm={handleDeleteEndpoint}
        title="Delete Endpoint"
        message={`Are you sure you want to delete "${endpointToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={isDeletingEndpoint}
      />
    </div>
  );
};

export default ProjectsSidebar;
