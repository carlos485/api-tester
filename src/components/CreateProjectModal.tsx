import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project } from "../types/project";
import Modal from "./Modal";
import Button from "./Button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreate: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => void;
}

interface NewProjectForm {
  name: string;
  description: string;
  icon: string;
}

const availableIcons = [
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
];


const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreate,
}) => {
  const [newProject, setNewProject] = useState<NewProjectForm>({
    name: "",
    description: "",
    icon: "material-symbols:api",
  });

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      onProjectCreate({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        icon: newProject.icon,
        environments: [
          {
            id: "default",
            name: "Development",
            baseUrl: "http://localhost:3000",
          },
        ],
      });

      // Reset form
      setNewProject({
        name: "",
        description: "",
        icon: "material-symbols:api",
      });

      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setNewProject({
      name: "",
      description: "",
      icon: "material-symbols:api",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            value={newProject.name}
            onChange={e =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-gray-500 focus:border-gray-500"
            placeholder="My API Project"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={newProject.description}
            onChange={e =>
              setNewProject({
                ...newProject,
                description: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-gray-500 focus:border-gray-500"
            placeholder="Optional project description"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Icon
          </label>
          <div className="grid grid-cols-4 gap-2">
            {availableIcons.map(icon => (
              <button
                key={icon}
                onClick={() => setNewProject({ ...newProject, icon })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  newProject.icon === icon
                    ? "border-gray-500 bg-gray-100 dark:bg-gray-600"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <Icon icon={icon} className="h-6 w-6 mx-auto dark:text-white" />
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={handleCreateProject}
          disabled={!newProject.name.trim()}
          variant="primary"
          className="flex-1"
        >
          Create Project
        </Button>
        <Button onClick={handleClose} variant="secondary" className="flex-1">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;
