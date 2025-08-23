import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Project } from "../types/project";
import Input from "./Input";

interface ProjectSelectorProps {
  projects: Project[];
  currentProject: Project;
  onProjectChange: (project: Project) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  currentProject,
  onProjectChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens - handled by autofocus attribute

  const handleProjectSelect = (project: Project) => {
    onProjectChange(project);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Project Button */}
      <button
        onClick={handleToggleDropdown}
        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        title="Switch project"
      >
        <div className="p-1 rounded-lg bg-gray-100">
          <Icon icon={currentProject.icon} className="h-5 w-5 text-gray-900" />
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold text-gray-900 group-hover:text-gray-700">
            {currentProject.name}
          </h1>
          {currentProject.description && (
            <p className="text-gray-600 text-sm line-clamp-1">
              {currentProject.description}
            </p>
          )}
        </div>
        <Icon
          icon={
            isOpen
              ? "material-symbols:expand-less"
              : "material-symbols:expand-more"
          }
          className="h-5 w-5 text-gray-400 ml-2 transition-transform"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              variant="full-width"
              autoFocus
              leftAddon={
                <Icon
                  icon="material-symbols:search"
                  className="h-4 w-4 text-gray-400"
                />
              }
            />
          </div>

          {/* Projects List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchQuery ? "No projects found" : "No projects available"}
              </div>
            ) : (
              filteredProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                    project.id === currentProject.id
                      ? "bg-gray-100 border-r-2 border-gray-500"
                      : ""
                  }`}
                >
                  <div className="p-1 rounded-lg bg-gray-100 flex-shrink-0">
                    <Icon
                      icon={project.icon}
                      className="h-5 w-5 text-gray-900"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  {project.id === currentProject.id && (
                    <Icon
                      icon="material-symbols:check"
                      className="h-4 w-4 text-gray-500 flex-shrink-0"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
