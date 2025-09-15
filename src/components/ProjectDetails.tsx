import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project } from "../types/project";
import Input from "./Input";
import { ProjectService } from "../services/projectService";

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
      <div className="flex items-start gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => setShowIconSelector(true)}
            className="h-8 w-8 rounded hover:bg-gray-100 transition-colors duration-200"
            disabled={isUpdating}
            title="Change icon"
          >
            <Icon icon={project.icon} className="h-8 w-8 text-gray-900" />
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
              className="text-2xl font-bold text-gray-900 w-full"
              autoFocus
              disabled={isUpdating}
            />
          ) : (
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
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
              className="text-gray-600 w-full mt-1"
              placeholder="Add a description..."
              autoFocus
              disabled={isUpdating}
            />
          ) : (
            <p
              className="text-gray-600 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
              onClick={() => setEditingDescription(true)}
              title="Click to edit description"
            >
              {project.description || 'Click to add description...'}
            </p>
          )}
        </div>
        
        {isUpdating && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">{project.createdAt.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <span className="ml-2 text-gray-600">{project.updatedAt.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Environments:</span>
              <span className="ml-2 text-gray-600">{project.environments.length} configured</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Environments</h3>
          <div className="space-y-3">
            {project.environments.map(env => (
              <div key={env.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">{env.name}</div>
                  <div className="text-sm text-gray-600">{env.baseUrl}</div>
                </div>
              </div>
            ))}
            {project.environments.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Icon icon="material-symbols:cloud-off" className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No environments configured</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional sections could be added here */}
      <div className="mt-6 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 text-sm text-gray-900 hover:bg-gray-50 rounded border border-gray-200">
            <Icon icon="material-symbols:add" className="h-4 w-4" />
            Add Endpoint
          </button>
          <button className="flex items-center justify-center gap-2 p-3 text-sm text-gray-900 hover:bg-gray-50 rounded border border-gray-200">
            <Icon icon="material-symbols:folder-add" className="h-4 w-4" />
            Add Folder
          </button>
          <button className="flex items-center justify-center gap-2 p-3 text-sm text-gray-900 hover:bg-gray-50 rounded border border-gray-200">
            <Icon icon="material-symbols:cloud-add" className="h-4 w-4" />
            Add Environment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;