import { Icon } from "@iconify/react";
import type { Project } from "../types/project";

interface ProjectCardProps {
  project: Project;
  onProjectSelect: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onProjectSelect, 
  onProjectDelete 
}) => {
  const cardColor = project.color || "bg-gray-100";
  
  const handleCardClick = () => {
    onProjectSelect(project);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    if (onProjectDelete) {
      onProjectDelete(project.id);
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 min-h-[180px] flex flex-col justify-center items-center ${cardColor} hover:scale-105`}
      onClick={handleCardClick}
    >
      {/* Delete button - only show on hover */}
      {onProjectDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
          title="Delete Project"
        >
          <Icon icon="material-symbols:close" className="h-4 w-4" />
        </button>
      )}

      {/* Project Icon */}
      <div className="mb-3">
        <Icon 
          icon={project.icon} 
          className="h-12 w-12 text-gray-700"
        />
      </div>

      {/* Project Name */}
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
        {project.name}
      </h3>

      {/* Project Description */}
      {project.description && (
        <p className="text-sm text-gray-600 text-center line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Environment count */}
      <div className="mt-auto pt-2">
        <span className="text-xs text-gray-500">
          {project.environments.length} environment{project.environments.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;