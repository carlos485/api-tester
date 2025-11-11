import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Project } from '@/features/projects/types';
import { Input, InputV2, TextareaV2, EnvironmentsTable, VariablesTable, EndpointsTable, type NativeSelectOption } from '@/shared/components/ui';
import { ProjectService } from '@/features/projects/services';
import { useEndpoints } from '@/features/endpoints/hooks';
import { Tabs, Tab } from '@/shared/components/ui';

interface ProjectDetailsProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
  onProjectDelete?: (projectId: string) => void;
}

interface VariableRow {
  id: string;
  name: string;
  value: string;
  description: string;
  environment: string;
  enabled: boolean;
}

interface EnvironmentRow {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
}

const AVAILABLE_ICONS = [
  "material-symbols:api",
  "material-symbols:web",
  "material-symbols:smartphone",
  "material-symbols:desktop-windows",
  "material-symbols:cloud",
  "material-symbols:database",
  "material-symbols:code",
  "material-symbols:settings",
  "zondicons:wallet",
  "mingcute:coupon-fill",
  "fa6-solid:user",
  "streamline-ultimate:tool-box-bold",
  "zondicons:notification",
  "tdesign:task-checked-filled",
  "streamline:bag-dollar-solid",
  "ci:transfer",
  "material-symbols:encrypted",
  "mdi:circle-slice-8",
  "mdi:cloud",
  "streamline-ultimate:crypto-encryption-key-bold",
];

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onProjectUpdate,
  onProjectDelete,
}) => {
  // Initialize all hooks before any conditional returns
  const [editingDescription, setEditingDescription] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [localName, setLocalName] = useState(project?.name || "");
  const [localDescription, setLocalDescription] = useState(
    project?.description || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [environmentSearchQuery, setEnvironmentSearchQuery] = useState("");
  const [endpointSearchQuery, setEndpointSearchQuery] = useState("");

  const { endpoints, folders } = useEndpoints(project?.id || "");

  // Convert project variables to array format for table display
  const variablesToArray = (): VariableRow[] => {
    if (!project) return [];
    const variables: VariableRow[] = [];

    // Add collection variables first
    if (project.collectionVariables) {
      Object.entries(project.collectionVariables).forEach(([name, value]) => {
        variables.push({
          id: `var-collection-${name}`, // Stable ID for collection variables
          name,
          value,
          description: "",
          environment: "GLOBAL",
          enabled: true,
        });
      });
    }

    // Add environment variables
    project.environments.forEach(env => {
      if (env.variables) {
        Object.entries(env.variables).forEach(([name, value]) => {
          variables.push({
            id: `var-${env.id}-${name}`, // Stable ID based on environment and name
            name,
            value,
            description: "",
            environment: env.id,
            enabled: true,
          });
        });
      }
    });

    return variables;
  };

  const [variableRows, setVariableRows] = useState<VariableRow[]>(() => {
    const existingVariables = variablesToArray();
    // Always add one empty row for new variables
    return [
      ...existingVariables,
      {
        id: `new-variable-${Date.now()}`,
        name: "",
        value: "",
        description: "",
        environment: "GLOBAL",
        enabled: true,
      },
    ];
  });

  const [environmentRows, setEnvironmentRows] = useState<EnvironmentRow[]>(() => {
    if (!project) return [];
    const existingEnvironments = project.environments.map(env => ({
      id: env.id,
      name: env.name,
      description: "",
      baseUrl: env.baseUrl,
    }));
    // Always add one empty row for new environments
    return [
      ...existingEnvironments,
      {
        id: `new-environment-${Date.now()}`,
        name: "",
        description: "",
        baseUrl: "",
      },
    ];
  });

  // Update variable rows when project changes or when switching between projects
  useEffect(() => {
    if (!project) return;
    const newVariables = variablesToArray();

    // Always update when project.id changes to ensure we show the correct project's variables
    setVariableRows([
      ...newVariables,
      {
        id: `new-variable-${Date.now()}`,
        name: "",
        value: "",
        description: "",
        environment: "GLOBAL",
        enabled: true,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]); // Run when project ID changes to load correct project's variables

  // Update environment rows when project changes or when switching between projects
  useEffect(() => {
    if (!project) return;
    const newEnvironments = project.environments.map(env => ({
      id: env.id,
      name: env.name,
      description: "",
      baseUrl: env.baseUrl,
    }));

    // Always update when project.id changes to ensure we show the correct project's environments
    setEnvironmentRows([
      ...newEnvironments,
      {
        id: `new-environment-${Date.now()}`,
        name: "",
        description: "",
        baseUrl: "",
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]); // Run when project ID changes to load correct project's environments

  // Sync local name and description when project changes
  useEffect(() => {
    if (project) {
      setLocalName(project.name || "");
      setLocalDescription(project.description || "");
    }
  }, [project]);

  // Early return if project is not loaded yet - AFTER all hooks
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  const handleVariableChange = (
    id: string,
    field: keyof VariableRow,
    value: string | boolean
  ) => {
    setVariableRows(prev => {
      const newRows = prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      // If the last row (empty row) is being edited, add a new empty row
      const lastRow = newRows[newRows.length - 1];
      if (
        lastRow &&
        (lastRow.name || lastRow.value) &&
        lastRow.id.startsWith("new-variable")
      ) {
        newRows.push({
          id: `new-variable-${Date.now()}`,
          name: "",
          value: "",
          description: "",
          environment: "GLOBAL",
          enabled: true,
        });
      }

      // Don't auto-save, just update local state
      return newRows;
    });
  };

  const handleDeleteVariable = (id: string) => {
    setVariableRows(prev => prev.filter(row => row.id !== id));
  };

  const handleEnvironmentChange = (
    id: string,
    field: keyof EnvironmentRow,
    value: string
  ) => {
    setEnvironmentRows(prev => {
      const newRows = prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      // If the last row (empty row) is being edited, add a new empty row
      const lastRow = newRows[newRows.length - 1];
      if (
        lastRow &&
        (lastRow.name || lastRow.baseUrl) &&
        lastRow.id.startsWith("new-environment")
      ) {
        newRows.push({
          id: `new-environment-${Date.now()}`,
          name: "",
          description: "",
          baseUrl: "",
        });
      }

      return newRows;
    });
  };

  const handleDeleteEnvironment = (id: string) => {
    setEnvironmentRows(prev => prev.filter(row => row.id !== id));
  };

  // Helper function to get folder name by ID
  const getFolderName = (folderId?: string): string => {
    if (!folderId) return "-";
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || "-";
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    // Check name changes
    if (localName.trim() !== project.name) return true;

    // Check description changes
    if (localDescription !== (project.description || "")) return true;

    // Check variable changes by comparing current variables with stored ones
    const currentVariables = variablesToArray();
    const currentVariableCount = currentVariables.length;
    const editedVariableCount = variableRows.filter(row => row.name.trim() && row.value.trim()).length;

    if (currentVariableCount !== editedVariableCount) return true;

    // Check if any variable content has changed
    for (const editedRow of variableRows) {
      if (!editedRow.name.trim() || !editedRow.value.trim()) continue;

      const existingVariable = currentVariables.find(v =>
        v.name === editedRow.name &&
        v.environment === editedRow.environment
      );

      if (!existingVariable || existingVariable.value !== editedRow.value) {
        return true;
      }
    }

    // Check environment changes
    const currentEnvironments = project.environments;
    const editedEnvironments = environmentRows.filter(row => row.name?.trim() && row.baseUrl?.trim());

    if (currentEnvironments.length !== editedEnvironments.length) return true;

    // Check if any environment content has changed
    for (const editedEnv of editedEnvironments) {
      const existingEnv = currentEnvironments.find(env => env.id === editedEnv.id);

      if (!existingEnv) return true; // New environment
      if (existingEnv.name !== editedEnv.name) return true;
      if (existingEnv.baseUrl !== editedEnv.baseUrl) return true;
    }

    return false;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Prepare all updates
      const updates: Partial<Project> = {};

      // Check if name changed
      if (localName.trim() !== project.name) {
        updates.name = localName.trim();
      }

      // Check if description changed
      if (localDescription !== (project.description || "")) {
        updates.description = localDescription;
      }

      // Process environments
      const updatedEnvironments = environmentRows
        .filter(row => row.name.trim() && row.baseUrl.trim())
        .map(row => ({
          id: row.id.startsWith("new-environment-") ? `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : row.id,
          name: row.name.trim(),
          baseUrl: row.baseUrl.trim(),
          variables: {} as Record<string, string>,
        }));

      const collectionVariables: Record<string, string> = {};

      // Group variables by environment
      variableRows.forEach(row => {
        if (row.name.trim() && row.value.trim() && row.enabled) {
          if (row.environment === "GLOBAL") {
            collectionVariables[row.name.trim()] = row.value.trim();
          } else {
            const envIndex = updatedEnvironments.findIndex(
              env => env.id === row.environment
            );
            if (envIndex !== -1) {
              updatedEnvironments[envIndex].variables![row.name.trim()] =
                row.value.trim();
            }
          }
        }
      });

      updates.environments = updatedEnvironments;
      updates.collectionVariables = collectionVariables;

      // Save to database
      await ProjectService.updateProject(project.id, updates);

      // Update parent component
      const updatedProject: Project = {
        ...project,
        ...updates,
        updatedAt: new Date(),
      };

      onProjectUpdate?.(updatedProject);

      console.log("All changes saved successfully!");
    } catch (error) {
      console.error("Error saving project changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await ProjectService.deleteProject(project.id);
      console.log("Project deleted successfully!");
      setShowDeleteConfirm(false);

      // Notify parent component about deletion
      onProjectDelete?.(project.id);
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDescriptionSave = () => {
    // Just stop editing, changes will be saved with the save button
    setEditingDescription(false);
  };

  const handleIconChange = (newIcon: string) => {
    // Icon changes will be saved with the save button, but we need to update local state
    // For now, we'll save icon changes immediately since there's no local state for icon
    if (newIcon !== project.icon) {
      setIsUpdating(true);
      ProjectService.updateProject(project.id, { icon: newIcon })
        .then(() => {
          onProjectUpdate?.({
            ...project,
            icon: newIcon,
            updatedAt: new Date(),
          });
        })
        .catch((error) => {
          console.error("Error updating project icon:", error);
        })
        .finally(() => {
          setIsUpdating(false);
        });
    }
    setShowIconSelector(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    saveFunction: () => void
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveFunction();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditingDescription(false);
      setLocalName(project.name);
      setLocalDescription(project.description || "");
    }
  };

  return (
    <div className="p-6">
      {/* Tabs Section */}
      <div>
        <Tabs
          variant="underline"
          defaultActiveTab={activeTabIndex}
          onTabChange={setActiveTabIndex}
        >
          <Tab header="Overview">
            {/* Two column layout */}
            <div className="grid grid-cols-12 gap-6 mt-6">
              {/* Left column - takes more space (8/12) */}
              <div className="col-span-8">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowIconSelector(true)}
                      className="h-12 w-12 rounded hover:bg-gray-100 transition-colors duration-200"
                      disabled={isUpdating}
                      title="Change icon"
                    >
                      <Icon icon={project.icon} className="h-12 w-12 text-gray-900 dark:text-gray-200" />
                    </button>

                    {showIconSelector && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                        <div className="max-h-[15rem] overflow-y-auto border border-gray-200 rounded-lg p-2 custom-scrollbar">
                          <div className="grid grid-cols-4 gap-2">
                            {AVAILABLE_ICONS.map(iconName => (
                              <button
                                key={iconName}
                                onClick={() => handleIconChange(iconName)}
                                className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${project.icon === iconName
                                  ? "border-gray-500 bg-gray-100"
                                  : "border-gray-200 hover:border-gray-300"
                                  }`}
                                disabled={isUpdating}
                              >
                                <Icon
                                  icon={iconName}
                                  className="h-6 w-6 text-gray-900 dark:text-gray-200"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => setShowIconSelector(false)}
                            className="w-full text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <InputV2
                      variant="ghost"
                      size="xl"
                      value={localName}
                      onChange={(value) => setLocalName(value)}
                      placeholder="Project name"
                    />

                    {editingDescription ? (
                      <TextareaV2
                        value={localDescription}
                        placeholder="Add a description..."
                        onBlur={handleDescriptionSave}
                        onKeyDown={e => handleKeyDown(e, handleDescriptionSave)}
                        onChange={(value) => setLocalDescription(value)}
                        disabled={isUpdating}
                        className="mt-3"
                      />
                    ) : (
                      <p
                        className="text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-60 rounded-lg px-3 py-2 -mx-3 -my-2 transition-colors mt-3 text-lg"
                        onClick={() => setEditingDescription(true)}
                        title="Click to edit description"
                      >
                        {project.description || "Click to add description..."}
                      </p>
                    )}
                  </div>

                  {isUpdating && (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - smaller space (4/12) */}
              <div className="col-span-4">
                <div className="p-4">
                  {/* Save Button */}
                  <div className="mb-6">
                    <button
                      onClick={handleSaveAll}
                      disabled={isSaving || isUpdating || !hasUnsavedChanges()}
                      className={`w-full px-4 py-3 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 ${hasUnsavedChanges()
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-100'
                        : 'bg-gray-400'
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving Changes...
                        </>
                      ) : hasUnsavedChanges() ? (
                        <>
                          <Icon icon="material-symbols:save" className="w-4 h-4" />
                          Save All Changes
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                            •
                          </span>
                        </>
                      ) : (
                        <>
                          <Icon icon="material-symbols:check" className="w-4 h-4" />
                          All Changes Saved
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delete Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting || isUpdating || isSaving}
                      className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Icon icon="material-symbols:delete" className="w-4 h-4" />
                      Delete Collection
                    </button>
                  </div>

                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0">
                            <Icon icon="material-symbols:warning" className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Delete Collection</h3>
                          </div>
                        </div>

                        <div className="mb-6">
                          <p className="text-sm text-gray-600">
                            Are you sure you want to delete <strong>"{project.name}"</strong>?
                            This action cannot be undone and will permanently delete:
                          </p>
                          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                            <li>All endpoints ({endpoints.length})</li>
                            <li>All folders ({folders.length})</li>
                            <li>All variables ({project.environments.reduce((total, env) => total + (env.variables ? Object.keys(env.variables).length : 0), 0) + (project.collectionVariables ? Object.keys(project.collectionVariables).length : 0)})</li>
                            <li>All environments ({project.environments.length})</li>
                          </ul>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteProject}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Icon icon="material-symbols:delete" className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="material-symbols:folder"
                          className="h-4 w-4 text-gray-600 dark:text-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Folders</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {folders.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="material-symbols:api"
                          className="h-4 w-4 text-gray-600 dark:text-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Endpoints</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {endpoints.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="material-symbols:variable"
                          className="h-4 w-4 text-gray-600 dark:text-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Variables</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {project.environments.reduce(
                          (total, env) =>
                            total +
                            (env.variables ? Object.keys(env.variables).length : 0),
                          0
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Created: {project.createdAt.toLocaleDateString()}</div>
                      <div>Updated: {project.updatedAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab>

          <Tab header="Environments">
            <div className="mt-6">
              {/* Search Input */}
              <div className="mb-4">
                <InputV2
                  value={environmentSearchQuery}
                  onChange={(value) => setEnvironmentSearchQuery(typeof value === 'string' ? value : value.target.value)}
                  placeholder="Search environments..."
                  leftIcon="material-symbols:search"
                />
              </div>

              <EnvironmentsTable
                rows={environmentRows.filter((environment) => {
                  if (!environmentSearchQuery) return true;
                  const query = environmentSearchQuery.toLowerCase();
                  return (
                    environment.name.toLowerCase().includes(query) ||
                    environment.description.toLowerCase().includes(query) ||
                    environment.baseUrl.toLowerCase().includes(query)
                  );
                })}
                onRowChange={handleEnvironmentChange}
                onDeleteRow={handleDeleteEnvironment}
              />
            </div>
          </Tab>

          <Tab header="Variables">
            <div className="mt-6">
              {/* Search Input */}
              <div className="mb-4">
                <InputV2
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(typeof value === 'string' ? value : value.target.value)}
                  placeholder="Search variables..."
                  leftIcon="material-symbols:search"
                />
              </div>

              <VariablesTable
                rows={variableRows.filter((variable) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    variable.name.toLowerCase().includes(query) ||
                    variable.value.toLowerCase().includes(query) ||
                    variable.description.toLowerCase().includes(query)
                  );
                })}
                onRowChange={handleVariableChange}
                onDeleteRow={handleDeleteVariable}
                environmentOptions={[
                  { value: "GLOBAL", label: "GLOBAL" },
                  ...project.environments.map(env => ({
                    value: env.id,
                    label: env.name
                  }))
                ]}
              />
            </div>
          </Tab>

          <Tab header="Endpoints">
            <div className="mt-6">
              {/* Search Input */}
              <div className="mb-4">
                <InputV2
                  value={endpointSearchQuery}
                  onChange={(value) => setEndpointSearchQuery(typeof value === 'string' ? value : value.target.value)}
                  placeholder="Search endpoints..."
                  leftIcon="material-symbols:search"
                />
              </div>

              <EndpointsTable
                rows={endpoints.filter((endpoint) => {
                  if (!endpointSearchQuery) return true;
                  const query = endpointSearchQuery.toLowerCase();
                  return (
                    endpoint.name.toLowerCase().includes(query) ||
                    endpoint.method.toLowerCase().includes(query) ||
                    endpoint.url.toLowerCase().includes(query) ||
                    getFolderName(endpoint.folder).toLowerCase().includes(query)
                  );
                })}
                getFolderName={getFolderName}
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;
