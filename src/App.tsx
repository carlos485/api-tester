import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import type { Project } from "./types/project";
import ProjectsHome from "./components/ProjectsHome";
import ProjectView from "./components/ProjectView";
import LoginPage from "./components/LoginPage";
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

// Wrapper component for ProjectView that gets project from URL params
const ProjectViewWrapper = ({ projects, onProjectCreate, onProjectDelete }: { projects: Project[], onProjectCreate: any, onProjectDelete: any }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return <Navigate to="/" replace />;
  }
  
  const handleBackToHome = () => {
    clearSelectedProject();
    navigate('/');
  };
  
  const handleProjectChange = (newProject: Project) => {
    saveSelectedProject(newProject.id);
    navigate(`/project/${newProject.id}`);
  };
  
  return (
    <ProjectView
      project={project}
      projects={projects}
      onBackToHome={handleBackToHome}
      onProjectChange={handleProjectChange}
    />
  );
};

// Main projects home wrapper
const ProjectsHomeWrapper = ({ projects, onProjectCreate, onProjectDelete }: { projects: Project[], onProjectCreate: any, onProjectDelete: any }) => {
  const navigate = useNavigate();
  
  const handleProjectSelect = (project: Project) => {
    saveSelectedProject(project.id);
    navigate(`/project/${project.id}`);
  };
  
  return (
    <ProjectsHome
      projects={projects}
      onProjectSelect={handleProjectSelect}
      onProjectCreate={onProjectCreate}
      onProjectDelete={onProjectDelete}
    />
  );
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects(user?.uid || null);
  const navigate = useNavigate();

  // Restore selected project from sessionStorage on app load
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      const savedProjectId = getSelectedProject();
      if (savedProjectId) {
        const savedProject = projects.find(p => p.id === savedProjectId);
        if (savedProject && window.location.pathname === '/') {
          // Only navigate if we're on the home page
          navigate(`/project/${savedProject.id}`, { replace: true });
        } else if (!savedProject) {
          // Project not found, clear from session storage
          clearSelectedProject();
        }
      }
    }
  }, [projects, projectsLoading, navigate]);

  const handleProjectCreate = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProject(projectData);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      // Clear session data and navigate to home if deleting current project
      const savedProjectId = getSelectedProject();
      if (savedProjectId === projectId) {
        clearAllSessionData();
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Show loading while authenticating
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show loading while loading projects
  if (projectsLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProjectsHomeWrapper 
            projects={projects}
            onProjectCreate={handleProjectCreate}
            onProjectDelete={handleProjectDelete}
          />
        } 
      />
      <Route 
        path="/project/:projectId" 
        element={
          <ProjectViewWrapper 
            projects={projects}
            onProjectCreate={handleProjectCreate}
            onProjectDelete={handleProjectDelete}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
