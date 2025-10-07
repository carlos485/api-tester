import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Project } from "../types/project";
import Input from "./Input";
import { ProjectService } from "../services/projectService";
import { useEndpoints } from "../hooks/useEndpoints";
import { Tabs, Tab } from "./Tabs";

interface ProjectDetailsProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
  onProjectDelete?: (projectId: string) => void;
}

interface VariableRow {
  id: string;
  name: string;
  value: string;
  environment: string;
  enabled: boolean;
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
  // Early return if project is not loaded yet
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

  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [localName, setLocalName] = useState(project.name);
  const [localDescription, setLocalDescription] = useState(
    project.description || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { endpoints, folders } = useEndpoints(project.id);

  // Convert project variables to array format for table display
  const variablesToArray = (): VariableRow[] => {
    const variables: VariableRow[] = [];

    // Add collection variables first
    if (project.collectionVariables) {
      Object.entries(project.collectionVariables).forEach(([name, value]) => {
        variables.push({
          id: `var-collection-${name}`, // Stable ID for collection variables
          name,
          value,
          environment: "collection",
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
        environment:
          project.environments.length > 0
            ? project.environments[0].id
            : "collection",
        enabled: true,
      },
    ];
  });

  // Update project variables when variableRows change
  const updateProjectVariables = async (rows: VariableRow[]) => {
    try {
      setIsUpdating(true);

      // Create a copy of environments to update
      const updatedEnvironments = project.environments.map(env => ({
        ...env,
        variables: {} as Record<string, string>,
      }));

      // Separate collection variables
      const collectionVariables: Record<string, string> = {};

      // Group variables by environment
      rows.forEach(row => {
        if (row.name.trim() && row.value.trim() && row.enabled) {
          if (row.environment === "collection") {
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

      // Update the project with new variables
      const updatedProject: Project = {
        ...project,
        environments: updatedEnvironments,
        collectionVariables,
        updatedAt: new Date(),
      };

      // Save to database
      await ProjectService.updateProject(project.id, {
        environments: updatedEnvironments,
        collectionVariables,
      });

      // Update parent component
      onProjectUpdate?.(updatedProject);
    } catch (error) {
      console.error("Error updating project variables:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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
          environment:
            project.environments.length > 0
              ? project.environments[0].id
              : "collection",
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

    return false;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Prepare all updates
      const updates: any = {};

      // Check if name changed
      if (localName.trim() !== project.name) {
        updates.name = localName.trim();
      }

      // Check if description changed
      if (localDescription !== (project.description || "")) {
        updates.description = localDescription;
      }

      // Process variables
      const updatedEnvironments = project.environments.map(env => ({
        ...env,
        variables: {} as Record<string, string>,
      }));

      const collectionVariables: Record<string, string> = {};

      // Group variables by environment
      variableRows.forEach(row => {
        if (row.name.trim() && row.value.trim() && row.enabled) {
          if (row.environment === "collection") {
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

  // Update variable rows when project changes (only on initial load)
  useEffect(() => {
    const newVariables = variablesToArray();
    setVariableRows(current => {
      // Only update if we don't have any variables yet (initial load)
      if (
        current.length <= 1 &&
        current[0]?.name === "" &&
        current[0]?.value === ""
      ) {
        return [
          ...newVariables,
          {
            id: `new-variable-${Date.now()}`,
            name: "",
            value: "",
            environment:
              project.environments.length > 0
                ? project.environments[0].id
                : "collection",
            enabled: true,
          },
        ];
      }
      return current;
    });
  }, [project.id]); // Only run when project ID changes, not on every environment update

  const handleNameSave = () => {
    // Just stop editing, changes will be saved with the save button
    setEditingName(false);
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
      setEditingName(false);
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
                      <Icon icon={project.icon} className="h-12 w-12 text-gray-900" />
                    </button>

                    {showIconSelector && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                        <div className="max-h-[15rem] overflow-y-auto border border-gray-200 rounded-lg p-2 custom-scrollbar">
                          <div className="grid grid-cols-4 gap-2">
                            {AVAILABLE_ICONS.map(iconName => (
                              <button
                                key={iconName}
                                onClick={() => handleIconChange(iconName)}
                                className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                                  project.icon === iconName
                                    ? "border-gray-500 bg-gray-100"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                disabled={isUpdating}
                              >
                                <Icon
                                  icon={iconName}
                                  className="h-6 w-6 text-gray-900"
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
                    {editingName ? (
                      <Input
                        type="text"
                        value={localName}
                        onChange={e => setLocalName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={e => handleKeyDown(e, handleNameSave)}
                        className="text-3xl font-bold text-gray-900 w-full"
                        autoFocus
                        disabled={isUpdating}
                      />
                    ) : (
                      <h1
                        className="text-3xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-3 py-2 -mx-3 -my-2 transition-colors"
                        onClick={() => setEditingName(true)}
                        title="Click to edit name"
                      >
                        {project.name}
                      </h1>
                    )}

                    {editingDescription ? (
                      <Input
                        type="text"
                        value={localDescription}
                        onChange={e => setLocalDescription(e.target.value)}
                        onBlur={handleDescriptionSave}
                        onKeyDown={e => handleKeyDown(e, handleDescriptionSave)}
                        className="text-gray-600 w-full mt-3 text-lg"
                        placeholder="Add a description..."
                        autoFocus
                        disabled={isUpdating}
                      />
                    ) : (
                      <p
                        className="text-gray-600 cursor-pointer hover:bg-gray-50 rounded px-3 py-2 -mx-3 -my-2 transition-colors mt-3 text-lg"
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
                      className={`w-full px-4 py-3 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 ${
                        hasUnsavedChanges()
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
                          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
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
                          className="h-4 w-4 text-gray-600"
                        />
                        <span className="text-sm text-gray-700">Folders</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {folders.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="material-symbols:api"
                          className="h-4 w-4 text-gray-600"
                        />
                        <span className="text-sm text-gray-700">Endpoints</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {endpoints.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="material-symbols:variable"
                          className="h-4 w-4 text-gray-600"
                        />
                        <span className="text-sm text-gray-700">Variables</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
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
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Created: {project.createdAt.toLocaleDateString()}</div>
                      <div>Updated: {project.updatedAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab>

          <Tab header="Variables">
            <div className="p-4 text-gray-500">
              Variables tab content
            </div>
          </Tab>

          <Tab header="Environments">
            <div className="p-4 text-gray-500">
              Environments tab content
            </div>
          </Tab>

          <Tab header="Endpoints">
            <div className="p-4 text-gray-500">
              Endpoints tab content
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;
