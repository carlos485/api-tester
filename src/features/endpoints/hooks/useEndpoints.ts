import { useState, useEffect, useCallback } from "react";
import { EndpointsService } from '@/features/endpoints/services';
import type { Endpoint, EndpointFolder } from '@/features/endpoints/types';

export const useEndpoints = (projectId: string | null) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [folders, setFolders] = useState<EndpointFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load endpoints and folders
  const loadEndpoints = useCallback(async () => {
    if (!projectId) {
      setEndpoints([]);
      setFolders([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [endpointsData, foldersData] = await Promise.all([
        EndpointsService.getEndpoints(projectId),
        EndpointsService.getEndpointFolders(projectId)
      ]);
      
      setEndpoints(endpointsData);
      setFolders(foldersData);
    } catch (err) {
      console.error("Error loading endpoints:", err);
      setError(err instanceof Error ? err.message : "Failed to load endpoints");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!projectId) {
      setEndpoints([]);
      setFolders([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to endpoints changes
    const unsubscribe = EndpointsService.subscribeToEndpoints(projectId, (updatedEndpoints) => {
      setEndpoints(updatedEndpoints);
      setLoading(false);
    });

    // Load folders (not real-time for now)
    EndpointsService.getEndpointFolders(projectId)
      .then(setFolders)
      .catch(err => {
        console.error("Error loading folders:", err);
        setError(err instanceof Error ? err.message : "Failed to load folders");
      });

    return unsubscribe;
  }, [projectId]);

  // Create endpoint
  const createEndpoint = useCallback(async (
    endpointData: Omit<Endpoint, "id" | "projectId" | "createdAt" | "updatedAt">
  ) => {
    if (!projectId) throw new Error("Project ID is required");
    
    try {
      setError(null);
      const id = await EndpointsService.createEndpoint({
        ...endpointData,
        projectId,
      });
      return id;
    } catch (err) {
      console.error("Error creating endpoint:", err);
      setError(err instanceof Error ? err.message : "Failed to create endpoint");
      throw err;
    }
  }, [projectId]);

  // Update endpoint
  const updateEndpoint = useCallback(async (
    id: string,
    updates: Partial<Omit<Endpoint, "id" | "projectId" | "createdAt" | "updatedAt">>
  ) => {
    try {
      setError(null);
      await EndpointsService.updateEndpoint(id, updates);
    } catch (err) {
      console.error("Error updating endpoint:", err);
      setError(err instanceof Error ? err.message : "Failed to update endpoint");
      throw err;
    }
  }, []);

  // Delete endpoint
  const deleteEndpoint = useCallback(async (id: string) => {
    try {
      setError(null);
      await EndpointsService.deleteEndpoint(id);
    } catch (err) {
      console.error("Error deleting endpoint:", err);
      setError(err instanceof Error ? err.message : "Failed to delete endpoint");
      throw err;
    }
  }, []);

  // Create folder
  const createFolder = useCallback(async (
    folderData: Omit<EndpointFolder, "id" | "projectId" | "createdAt" | "updatedAt">
  ) => {
    if (!projectId) throw new Error("Project ID is required");
    
    try {
      setError(null);
      const id = await EndpointsService.createEndpointFolder({
        ...folderData,
        projectId,
      });
      // Reload folders to get updated list
      const updatedFolders = await EndpointsService.getEndpointFolders(projectId);
      setFolders(updatedFolders);
      return id;
    } catch (err) {
      console.error("Error creating folder:", err);
      setError(err instanceof Error ? err.message : "Failed to create folder");
      throw err;
    }
  }, [projectId]);

  // Update folder
  const updateFolder = useCallback(async (
    id: string,
    updates: Partial<Omit<EndpointFolder, "id" | "projectId" | "createdAt" | "updatedAt">>
  ) => {
    if (!projectId) return;
    
    try {
      setError(null);
      await EndpointsService.updateEndpointFolder(id, updates);
      // Reload folders to get updated list
      const updatedFolders = await EndpointsService.getEndpointFolders(projectId);
      setFolders(updatedFolders);
    } catch (err) {
      console.error("Error updating folder:", err);
      setError(err instanceof Error ? err.message : "Failed to update folder");
      throw err;
    }
  }, [projectId]);

  // Delete folder
  const deleteFolder = useCallback(async (id: string) => {
    if (!projectId) return;
    
    try {
      setError(null);
      await EndpointsService.deleteEndpointFolder(id);
      // Reload folders to get updated list
      const updatedFolders = await EndpointsService.getEndpointFolders(projectId);
      setFolders(updatedFolders);
    } catch (err) {
      console.error("Error deleting folder:", err);
      setError(err instanceof Error ? err.message : "Failed to delete folder");
      throw err;
    }
  }, [projectId]);

  return {
    endpoints,
    folders,
    loading,
    error,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    createFolder,
    updateFolder,
    deleteFolder,
    refetch: loadEndpoints,
  };
};