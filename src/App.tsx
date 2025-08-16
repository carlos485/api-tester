import { useState } from "react";
import type { Project } from "./types/project";
import ProjectsHome from "./components/ProjectsHome";
import ProjectView from "./components/ProjectView";

// Sample projects data - in a real app this would come from a backend or local storage
const initialProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce API",
    description: "Testing API endpoints for the online store",
    icon: "material-symbols:shopping-cart",
    color: "bg-blue-100",
    createdAt: new Date(),
    updatedAt: new Date(),
    environments: [
      { id: "dev", name: "Development", baseUrl: "http://localhost:3000" },
      { id: "prod", name: "Production", baseUrl: "https://api.mystore.com" },
    ],
  },
  {
    id: "2",
    name: "User Management",
    description: "User authentication and profile management",
    icon: "material-symbols:person",
    color: "bg-green-100",
    createdAt: new Date(),
    updatedAt: new Date(),
    environments: [
      { id: "dev", name: "Development", baseUrl: "http://localhost:8080" },
      { id: "staging", name: "Staging", baseUrl: "https://staging-auth.example.com" },
    ],
  },
];

function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToHome = () => {
    setSelectedProject(null);
  };

  const handleProjectCreate = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects([...projects, newProject]);
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  if (selectedProject) {
    return (
      <ProjectView
        project={selectedProject}
        onBackToHome={handleBackToHome}
      />
    );
  }

  return (
    <ProjectsHome
      projects={projects}
      onProjectSelect={handleProjectSelect}
      onProjectCreate={handleProjectCreate}
      onProjectDelete={handleProjectDelete}
    />
  );
}

export default App;
