import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project } from "../types/project";
import ProjectCard from "./ProjectCard";
import Button from "./Button";

interface ProjectsHomeProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => void;
  onProjectDelete: (projectId: string) => void;
}

interface NewProjectForm {
  name: string;
  description: string;
  icon: string;
  color: string;
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
];

const availableColors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-purple-100",
  "bg-yellow-100",
  "bg-pink-100",
  "bg-indigo-100",
  "bg-red-100",
  "bg-orange-100",
];

const ProjectsHome: React.FC<ProjectsHomeProps> = ({
  projects,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState<NewProjectForm>({
    name: "",
    description: "",
    icon: "material-symbols:api",
    color: "bg-blue-100",
  });

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      onProjectCreate({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        icon: newProject.icon,
        color: newProject.color,
        environments: [
          {
            id: "default",
            name: "Development",
            baseUrl: "http://localhost:3000",
          },
        ],
      });

      setNewProject({
        name: "",
        description: "",
        icon: "material-symbols:api",
        color: "bg-blue-100",
      });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                API Tester
              </h1>
              <p className="text-gray-600 mt-1 dark:text-gray-400">
                Manage your API testing projects
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              icon="material-symbols:add"
              variant="primary"
            >
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Icon
              icon="material-symbols:folder-open"
              className="h-24 w-24 text-gray-400 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to start testing APIs
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onProjectSelect={onProjectSelect}
                onProjectDelete={onProjectDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={e =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                  placeholder="My API Project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Optional project description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewProject({ ...newProject, icon })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        newProject.icon === icon
                          ? "border-gray-500 bg-gray-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon icon={icon} className="h-6 w-6 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={`h-10 rounded-lg border-2 transition-colors ${color} ${
                        newProject.color === color
                          ? "border-gray-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    />
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
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsHome;
