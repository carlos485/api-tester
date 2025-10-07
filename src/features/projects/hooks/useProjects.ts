import { useState, useEffect } from 'react';
import { ProjectService } from '@/features/projects/services';
import type { Project } from '@/features/projects/types';

export const useProjects = (userId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = ProjectService.subscribeToUserProjects(
      userId,
      (projects) => {
        setProjects(projects);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      await ProjectService.createProject(projectData, userId);
    } catch (error) {
      setError('Failed to create project');
      throw error;
    }
  };

  const updateProject = async (
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      await ProjectService.updateProject(projectId, updates);
    } catch (error) {
      setError('Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await ProjectService.deleteProject(projectId);
    } catch (error) {
      setError('Failed to delete project');
      throw error;
    }
  };

  const updateProjectEnvironments = async (projectId: string, environments: Project['environments']) => {
    try {
      await ProjectService.updateProjectEnvironments(projectId, environments);
    } catch (error) {
      setError('Failed to update project environments');
      throw error;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    updateProjectEnvironments,
  };
};