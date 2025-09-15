import { Icon } from "@iconify/react";
import type { Project } from "../types/project";

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon icon={project.icon} className="h-8 w-8 text-gray-900" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600">{project.description || 'No description available'}</p>
        </div>
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