import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Endpoint, EndpointFolder } from "../types/project";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";

interface ProjectsSidebarProps {
  onEndpointSelect: (endpoint: Endpoint & { projectId: string }) => void;
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
  selectedEndpointId,
}) => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects(user?.uid || null);
  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([]);

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

  // For now, we'll show projects with sample data to demonstrate the structure
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      const nodes: ProjectNode[] = projects.map(project => {
        // Sample data - in the future this will come from the database
        const sampleEndpoints: Endpoint[] = [
          {
            id: "1",
            projectId: project.id,
            name: "Get Users",
            method: "GET",
            url: "/api/users",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "2",
            projectId: project.id,
            name: "Create User",
            method: "POST",
            url: "/api/users",
            folder: "auth-folder",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "3",
            projectId: project.id,
            name: "Login",
            method: "POST",
            url: "/api/auth/login",
            folder: "auth-folder",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const sampleFolders: EndpointFolder[] = [
          {
            id: "auth-folder",
            projectId: project.id,
            name: "Authentication",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const { folders, endpoints } = organizeProjectData(
          project.id,
          sampleEndpoints,
          sampleFolders
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
  }, [projects, projectsLoading]);

  const toggleProjectExpansion = (projectId: string) => {
    setProjectNodes(prev =>
      prev.map(node =>
        node.id === projectId ? { ...node, expanded: !node.expanded } : node
      )
    );
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
                className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer ${
                  selectedEndpointId === endpoint.id
                    ? "bg-blue-50 border-l-2 border-blue-500"
                    : ""
                }`}
                onClick={() => onEndpointSelect(endpoint)}
                style={{ marginLeft: `${(depth + 1) * 16}px` }}
              >
                <div className="w-4" /> {/* Spacer for alignment */}
                <span
                  className={`text-xs font-medium ${getMethodColor(
                    endpoint.method
                  )} min-w-[45px]`}
                >
                  {endpoint.method}
                </span>
                <span className="text-sm text-gray-700 truncate">
                  {endpoint.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  if (projectsLoading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Collections</h2>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="New Collection"
          >
            <Icon icon="material-symbols:add" className="h-4 w-4" />
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
            <p className="text-sm">No collections yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projectNodes.map(project => (
              <div key={project.id}>
                {/* Project Node */}
                <div
                  className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => toggleProjectExpansion(project.id)}
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
                        className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer ${
                          selectedEndpointId === endpoint.id
                            ? "bg-blue-50 border-l-2 border-blue-500"
                            : ""
                        }`}
                        onClick={() => onEndpointSelect(endpoint)}
                      >
                        <div className="w-4" /> {/* Spacer for alignment */}
                        <span
                          className={`text-xs font-medium ${getMethodColor(
                            endpoint.method
                          )} min-w-[45px]`}
                        >
                          {endpoint.method}
                        </span>
                        <span className="text-sm text-gray-700 truncate">
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

      {/* Add Request Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-900 hover:bg-blue-50 rounded border border-blue-200">
          <Icon icon="material-symbols:add" className="h-4 w-4" />
          New Request
        </button>
      </div>
    </div>
  );
};

export default ProjectsSidebar;
