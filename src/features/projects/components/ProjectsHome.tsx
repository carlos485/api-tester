import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Project } from '@/features/projects/types';
import { ProjectCard } from '@/features/projects/components';
import { Button } from '@/shared/components/ui';
import { CreateProjectModal } from '@/features/projects/components';
import { UserMenu } from '@/features/auth/components';

interface ProjectsHomeProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => void;
  onProjectDelete: (projectId: string) => void;
}


const ProjectsHome: React.FC<ProjectsHomeProps> = ({
  projects,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
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
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                icon="material-symbols:add"
                variant="primary"
              >
                New Project
              </Button>
              <UserMenu />
            </div>
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

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreate={onProjectCreate}
      />
    </div>
  );
};

export default ProjectsHome;
