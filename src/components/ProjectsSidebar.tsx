import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Endpoint } from "../types/project";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";

interface ProjectsSidebarProps {
  onEndpointSelect: (endpoint: Endpoint & { projectId: string }) => void;
  selectedEndpointId?: string;
}

interface ProjectNode {
  id: string;
  name: string;
  type: 'project';
  expanded: boolean;
  folders: FolderNode[];
  endpoints: (Endpoint & { projectId: string })[];
}

interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  expanded: boolean;
  endpoints: (Endpoint & { projectId: string })[];
}

const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({
  onEndpointSelect,
  selectedEndpointId,
}) => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects(user?.uid || null);
  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([]);

  // For now, we'll show projects without endpoints to get the basic structure working
  // TODO: Add proper endpoint loading later
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      const nodes: ProjectNode[] = projects.map(project => ({
        id: project.id,
        name: project.name,
        type: 'project' as const,
        expanded: true,
        folders: [],
        endpoints: [], // For now, empty - we'll add endpoint loading later
      }));
      setProjectNodes(nodes);
    }
  }, [projects, projectsLoading]);

  const toggleProjectExpansion = (projectId: string) => {
    setProjectNodes(prev =>
      prev.map(node =>
        node.id === projectId
          ? { ...node, expanded: !node.expanded }
          : node
      )
    );
  };

  const toggleFolderExpansion = (projectId: string, folderId: string) => {
    setProjectNodes(prev =>
      prev.map(node =>
        node.id === projectId
          ? {
              ...node,
              folders: node.folders.map(folder =>
                folder.id === folderId
                  ? { ...folder, expanded: !folder.expanded }
                  : folder
              ),
            }
          : node
      )
    );
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-600';
      case 'POST':
        return 'text-blue-600';
      case 'PUT':
        return 'text-orange-600';
      case 'DELETE':
        return 'text-red-600';
      case 'PATCH':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
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
            <Icon icon="material-symbols:folder-outline" className="h-8 w-8 mx-auto mb-2" />
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
                    icon={project.expanded ? "material-symbols:expand-more" : "material-symbols:chevron-right"}
                    className="h-4 w-4 text-gray-500"
                  />
                  <Icon icon="material-symbols:folder" className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </span>
                </div>

                {/* Project Contents */}
                {project.expanded && (
                  <div className="ml-4 space-y-1">
                    {/* Folders */}
                    {project.folders.map(folder => (
                      <div key={folder.id}>
                        <div
                          className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => toggleFolderExpansion(project.id, folder.id)}
                        >
                          <Icon
                            icon={folder.expanded ? "material-symbols:expand-more" : "material-symbols:chevron-right"}
                            className="h-4 w-4 text-gray-500"
                          />
                          <Icon icon="material-symbols:folder" className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-700 truncate">
                            {folder.name}
                          </span>
                        </div>

                        {/* Folder Endpoints */}
                        {folder.expanded && (
                          <div className="ml-4 space-y-1">
                            {folder.endpoints.map(endpoint => (
                              <div
                                key={`${endpoint.projectId}-${endpoint.id}`}
                                className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer ${
                                  selectedEndpointId === endpoint.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                }`}
                                onClick={() => onEndpointSelect(endpoint)}
                              >
                                <div className="w-4" /> {/* Spacer for alignment */}
                                <span className={`text-xs font-medium ${getMethodColor(endpoint.method)}`}>
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

                    {/* Direct Project Endpoints */}
                    {project.endpoints.map(endpoint => (
                      <div
                        key={`${endpoint.projectId}-${endpoint.id}`}
                        className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer ${
                          selectedEndpointId === endpoint.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                        onClick={() => onEndpointSelect(endpoint)}
                      >
                        <div className="w-4" /> {/* Spacer for alignment */}
                        <span className={`text-xs font-medium ${getMethodColor(endpoint.method)} min-w-[45px]`}>
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
        <button className="w-full flex items-center justify-center gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200">
          <Icon icon="material-symbols:add" className="h-4 w-4" />
          New Request
        </button>
      </div>
    </div>
  );
};

export default ProjectsSidebar;