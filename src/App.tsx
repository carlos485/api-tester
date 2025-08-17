import { useState, useEffect } from "react";
import type { Project } from "./types/project";
import ProjectsHome from "./components/ProjectsHome";
import ProjectView from "./components/ProjectView";
import { useAuth } from "./hooks/useAuth";
import { useProjects } from "./hooks/useProjects";

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const { user, loading: authLoading, signInAnonymously } = useAuth();
  const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects(user?.uid || null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Auto sign-in anonymously if no user
  useEffect(() => {
    if (!authLoading && !user) {
      signInAnonymously();
    }
  }, [authLoading, user, signInAnonymously]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToHome = () => {
    setSelectedProject(null);
  };

  const handleProjectCreate = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProject(projectData);
    } catch (error) {
      console.error('Failed to create project:', error);
      // Here you could show a toast notification or error message
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      // Here you could show a toast notification or error message
    }
  };

  // Show loading while authenticating or loading projects
  if (authLoading || (user && projectsLoading)) {
    return <LoadingScreen />;
  }

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
