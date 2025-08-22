import { useState, useEffect } from "react";
import type { Project } from "./types/project";
import ProjectsHome from "./components/ProjectsHome";
import ProjectView from "./components/ProjectView";
import { useAuth } from "./hooks/useAuth";
import { useProjects } from "./hooks/useProjects";
import { 
  saveSelectedProject, 
  getSelectedProject, 
  clearSelectedProject,
  clearAllSessionData
} from "./utils/sessionStorage";

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
  const [shouldRestore, setShouldRestore] = useState(true);

  // Auto sign-in anonymously if no user
  useEffect(() => {
    if (!authLoading && !user) {
      signInAnonymously();
    }
  }, [authLoading, user, signInAnonymously]);

  // Restore selected project from sessionStorage (only once on app load)
  useEffect(() => {
    if (!projectsLoading && projects.length > 0 && !selectedProject && shouldRestore) {
      const savedProjectId = getSelectedProject();
      if (savedProjectId) {
        const savedProject = projects.find(p => p.id === savedProjectId);
        if (savedProject) {
          setSelectedProject(savedProject);
        } else {
          // Project not found, clear from session storage
          clearSelectedProject();
        }
      }
      setShouldRestore(false); // Disable further automatic restoration
    }
  }, [projects, projectsLoading, selectedProject, shouldRestore]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    saveSelectedProject(project.id);
  };

  const handleBackToHome = () => {
    setSelectedProject(null);
    clearSelectedProject();
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
        clearAllSessionData(); // Clear all session data when deleting current project
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
