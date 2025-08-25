import { useState } from "react";
import { Icon } from "@iconify/react";
import Input from "./Input";
import type { Endpoint, HttpMethod } from "../types/project";

interface SidebarProps {
  endpoints: Endpoint[];
  onEndpointSelect: (endpoint: Endpoint) => void;
  onAddEndpoint?: () => void;
  selectedEndpointId?: string;
  loading?: boolean;
}

const methodColors: Record<HttpMethod, string> = {
  GET: "text-green-600",
  POST: "text-yellow-600",
  PUT: "text-blue-600",
  PATCH: "text-purple-600",
  DELETE: "text-red-600",
  HEAD: "text-gray-600",
  OPTIONS: "text-indigo-600",
};

const Sidebar: React.FC<SidebarProps> = ({
  endpoints,
  onEndpointSelect,
  onAddEndpoint,
  selectedEndpointId,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const filteredEndpoints = endpoints.filter(
    endpoint =>
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group endpoints by folder
  const groupedEndpoints = filteredEndpoints.reduce((acc, endpoint) => {
    const folder = endpoint.folder || "General";
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(endpoint);
    return acc;
  }, {} as Record<string, Endpoint[]>);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Endpoints</h2>
        <Input
          type="text"
          placeholder="Search endpoints..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="full-width"
          leftAddon={
            <Icon
              icon="material-symbols:search"
              className="h-4 w-4 text-gray-400"
            />
          }
        />
      </div>

      {/* Endpoints List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading endpoints...</p>
          </div>
        ) : Object.keys(groupedEndpoints).length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Icon
              icon="material-symbols:search-off"
              className="h-8 w-8 mx-auto mb-2 text-gray-300"
            />
            <p className="text-sm">
              {endpoints.length === 0
                ? "No endpoints yet"
                : "No endpoints found"}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedEndpoints).map(
              ([folder, folderEndpoints]) => (
                <div key={folder} className="mb-2">
                  {/* Folder Header */}
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700"
                  >
                    <Icon
                      icon={
                        expandedFolders.has(folder)
                          ? "material-symbols:expand-more"
                          : "material-symbols:chevron-right"
                      }
                      className="h-4 w-4"
                    />
                    <Icon icon="line-md:folder" className="h-4 w-4" />
                    <span>{folder}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {folderEndpoints.length}
                    </span>
                  </button>

                  {/* Endpoints in folder */}
                  {expandedFolders.has(folder) && (
                    <div className="ml-6 mt-1">
                      {folderEndpoints.map(endpoint => (
                        <button
                          key={endpoint.id}
                          onClick={() => onEndpointSelect(endpoint)}
                          className={`w-full text-left p-2 rounded-lg transition-colors duration-200 ${
                            selectedEndpointId === endpoint.id
                              ? "bg-gray-50 border-l-2 border-gray-500"
                              : "hover:bg-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                methodColors[endpoint.method]
                              }`}
                            >
                              {endpoint.method}
                            </span>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {endpoint.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {endpoint.url}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onAddEndpoint}
          disabled={!onAddEndpoint}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
        >
          <Icon icon="material-symbols:add" className="h-4 w-4" />
          New Endpoint
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
