import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Endpoint, EndpointFolder, Project } from "../types/project";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";
import { useEndpoints } from "../hooks/useEndpoints";

interface ProjectsSidebarProps {
  onEndpointSelect: (endpoint: Endpoint & { projectId: string }) => void;
  onProjectSelect: (project: Project) => void;
  selectedEndpointId?: string;
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
}) => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects(user?.uid || null);
  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([]);
  const [projectEndpoints, setProjectEndpoints] = useState<Record<string, { endpoints: Endpoint[], folders: EndpointFolder[] }>>({});
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


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
          const { EndpointsService } = await import("../services/endpointsService");
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
                className={`flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${
                  selectedEndpointId === endpoint.id
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : ""
                }`}
                onClick={() => onEndpointSelect(endpoint)}
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
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {endpoint.name}
                </span>
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
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
                  className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <Icon
                    icon={
                      project.expanded
                        ? "material-symbols:expand-more"
                        : "material-symbols:chevron-right"
                    }
                    className="h-4 w-4 text-gray-500"
                  />
                  <Icon
                    icon={
                      projects.find(p => p.id === project.id)?.icon ||
                      "material-symbols:folder"
                    }
                    className="h-4 w-4 text-gray-900"
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </span>
                </div>

                {/* Project Contents */}
                {project.expanded && (
                  <div className="ml-4 space-y-1">
                    {/* Folders (using recursive rendering) */}
                    {renderFolders(project.folders, project.id)}

                    {/* Direct Project Endpoints (not in any folder) */}
                    {project.endpoints.map(endpoint => (
                      <div
                        key={`${endpoint.projectId}-${endpoint.id}`}
                        className={`flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${
                          selectedEndpointId === endpoint.id
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : ""
                        }`}
                        onClick={() => onEndpointSelect(endpoint)}
                      >
                        <div className="w-4" /> {/* Spacer for alignment */}
                        <span
                          className={`text-xs font-semibold ${getMethodColor(
                            endpoint.method
                          )} min-w-[42px]`}
                        >
                          {endpoint.method}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {endpoint.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectsSidebar;
