import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project } from "../types/project";
import Input from "./Input";

interface ProjectSelectionModalProps {
  isOpen: boolean;
  projects: Project[];
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (projectData: {
    name: string;
    description: string;
    icon: string;
  }) => void;
  isCreating?: boolean;
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

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  isOpen,
  projects,
  onClose,
  onSelectProject,
  onCreateProject,
  isCreating = false,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(projects.length === 0);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("material-symbols:api");

  if (!isOpen) return null;

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    onCreateProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      icon: selectedIcon,
    });
  };

  const resetForm = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedIcon("material-symbols:api");
    setShowCreateForm(projects.length === 0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {showCreateForm ? "Create New Collection" : "Select Collection"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="material-symbols:close" className="h-6 w-6" />
          </button>
        </div>

        {!showCreateForm && projects.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Choose an existing collection:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon icon={project.icon} className="h-8 w-8 text-gray-700" />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{project.name}</h5>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                    </div>
                    <Icon icon="material-symbols:arrow-forward" className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="material-symbols:add" className="h-5 w-5" />
                  <span className="font-medium">Create New Collection</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {showCreateForm && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Name *
              </label>
              <Input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., My API Collection"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Input
                type="text"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Optional description for your collection"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Icon icon={selectedIcon} className="h-8 w-8 text-gray-700" />
                  <span className="text-sm text-gray-600">Selected icon</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-10 gap-3">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        onClick={() => setSelectedIcon(iconName)}
                        className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center hover:scale-105 ${
                          selectedIcon === iconName
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon icon={iconName} className="h-6 w-6 text-gray-700" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {projects.length > 0 && (
                <button
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
                >
                  Back to Collections
                </button>
              )}
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon icon="material-symbols:add" className="w-4 h-4" />
                    Create Collection
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!showCreateForm && projects.length === 0 && (
          <div className="text-center py-8">
            <Icon icon="material-symbols:folder-open" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No collections found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelectionModal;