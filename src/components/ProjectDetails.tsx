import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project } from "../types/project";
import Input from "./Input";
import { ProjectService } from "../services/projectService";
import { useEndpoints } from "../hooks/useEndpoints";
import { Tabs, Tab } from "./Tabs";

interface ProjectDetailsProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
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

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onProjectUpdate }) => {
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [localName, setLocalName] = useState(project.name);
  const [localDescription, setLocalDescription] = useState(project.description || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const { endpoints, folders } = useEndpoints(project.id);

  const handleNameSave = async () => {
    if (localName.trim() && localName !== project.name) {
      setIsUpdating(true);
      try {
        await ProjectService.updateProject(project.id, { name: localName.trim() });
        onProjectUpdate?.({
          ...project,
          name: localName.trim(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating project name:', error);
        setLocalName(project.name);
      } finally {
        setIsUpdating(false);
      }
    }
    setEditingName(false);
  };

  const handleDescriptionSave = async () => {
    if (localDescription !== (project.description || "")) {
      setIsUpdating(true);
      try {
        await ProjectService.updateProject(project.id, { description: localDescription });
        onProjectUpdate?.({
          ...project,
          description: localDescription,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating project description:', error);
        setLocalDescription(project.description || "");
      } finally {
        setIsUpdating(false);
      }
    }
    setEditingDescription(false);
  };

  const handleIconChange = async (newIcon: string) => {
    if (newIcon !== project.icon) {
      setIsUpdating(true);
      try {
        await ProjectService.updateProject(project.id, { icon: newIcon });
        onProjectUpdate?.({
          ...project,
          icon: newIcon,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating project icon:', error);
      } finally {
        setIsUpdating(false);
      }
    }
    setShowIconSelector(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, saveFunction: () => void) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveFunction();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditingName(false);
      setEditingDescription(false);
      setLocalName(project.name);
      setLocalDescription(project.description || "");
    }
  };

  return (
    <div className="p-6">
      {/* Two column layout */}
      <div className="grid grid-cols-12 gap-6">
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
                      {AVAILABLE_ICONS.map((iconName) => (
                        <button
                          key={iconName}
                          onClick={() => handleIconChange(iconName)}
                          className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                            project.icon === iconName
                              ? 'border-gray-500 bg-gray-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          disabled={isUpdating}
                        >
                          <Icon icon={iconName} className="h-6 w-6 text-gray-900" />
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
                  onChange={(e) => setLocalName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => handleKeyDown(e, handleNameSave)}
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
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onBlur={handleDescriptionSave}
                  onKeyDown={(e) => handleKeyDown(e, handleDescriptionSave)}
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
                  {project.description || 'Click to add description...'}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="material-symbols:folder" className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Folders</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{folders.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="material-symbols:api" className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Endpoints</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{endpoints.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="material-symbols:variable" className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Variables</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {project.environments.reduce((total, env) =>
                    total + (env.variables ? Object.keys(env.variables).length : 0), 0
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

      {/* Tabs Section */}
      <div className="mt-8">
        <Tabs
          variant="underline"
          defaultActiveTab={activeTabIndex}
          onTabChange={setActiveTabIndex}
        >
          <Tab header="Variables">
            <div className="space-y-4">
              {project.environments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon icon="material-symbols:variable" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No environments configured yet</p>
                  <p className="text-sm">Add an environment to start defining variables</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {project.environments.map((environment) => (
                    <div key={environment.id} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon icon="material-symbols:cloud" className="h-4 w-4 text-gray-600" />
                            <h3 className="font-medium text-gray-900">{environment.name}</h3>
                          </div>
                          <span className="text-sm text-gray-500">
                            {environment.variables ? Object.keys(environment.variables).length : 0} variables
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{environment.baseUrl}</p>
                      </div>

                      <div className="p-4">
                        {!environment.variables || Object.keys(environment.variables).length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Icon icon="material-symbols:variable" className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No variables defined for this environment</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3">Variable Name</th>
                                  <th scope="col" className="px-6 py-3">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(environment.variables).map(([key, value]) => (
                                  <tr key={key} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                      {key}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-mono text-sm">
                                      {value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;