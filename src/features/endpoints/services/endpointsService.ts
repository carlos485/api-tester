import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Endpoint, EndpointFolder } from '@/features/endpoints/types';

const ENDPOINTS_COLLECTION = "endpoints";
const ENDPOINT_FOLDERS_COLLECTION = "endpointFolders";

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firestore timestamp
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export class EndpointsService {
  // Debug method to get all endpoints
  static async getAllEndpoints(): Promise<Record<string, unknown>[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ENDPOINTS_COLLECTION));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting all endpoints:", error);
      throw error;
    }
  }

  // Get all endpoints for a project
  static async getEndpoints(projectId: string): Promise<Endpoint[]> {
    try {
      const q = query(
        collection(db, ENDPOINTS_COLLECTION),
        where("projectId", "==", projectId)
      );
      
      const querySnapshot = await getDocs(q);
      const endpoints = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Endpoint;
      });
      
      // Sort by createdAt descending in client
      return endpoints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error("Error getting endpoints:", error);
      throw error;
    }
  }

  // Subscribe to endpoints changes
  static subscribeToEndpoints(
    projectId: string,
    callback: (endpoints: Endpoint[]) => void
  ): () => void {
    const q = query(
      collection(db, ENDPOINTS_COLLECTION),
      where("projectId", "==", projectId)
    );

    return onSnapshot(q, (snapshot) => {
      const endpoints = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Endpoint;
      });
      
      // Sort by createdAt descending in client
      const sortedEndpoints = endpoints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(sortedEndpoints);
    });
  }

  // Create a new endpoint
  static async createEndpoint(
    endpointData: Omit<Endpoint, "id" | "createdAt" | "updatedAt">,
    projectId?: string
  ): Promise<string> {
    try {
      const now = new Date();

      // Ensure projectId is included in the data
      const finalEndpointData = {
        ...endpointData,
        projectId: projectId || endpointData.projectId, // Use passed projectId or fallback to data.projectId
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      };

      console.log('Creating endpoint with data:', finalEndpointData);

      const docRef = await addDoc(collection(db, ENDPOINTS_COLLECTION), finalEndpointData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating endpoint:", error);
      throw error;
    }
  }

  // Update an endpoint
  static async updateEndpoint(
    id: string,
    updates: Partial<Omit<Endpoint, "id" | "projectId" | "createdAt" | "updatedAt">>
  ): Promise<void> {
    try {
      const endpointRef = doc(db, ENDPOINTS_COLLECTION, id);
      await updateDoc(endpointRef, {
        ...updates,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error("Error updating endpoint:", error);
      throw error;
    }
  }

  // Delete an endpoint
  static async deleteEndpoint(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ENDPOINTS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting endpoint:", error);
      throw error;
    }
  }

  // Get all folders for a project
  static async getEndpointFolders(projectId: string): Promise<EndpointFolder[]> {
    try {
      const q = query(
        collection(db, ENDPOINT_FOLDERS_COLLECTION),
        where("projectId", "==", projectId)
      );
      
      const querySnapshot = await getDocs(q);
      const folders = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as EndpointFolder;
      });
      
      // Sort by createdAt descending in client
      return folders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error("Error getting endpoint folders:", error);
      throw error;
    }
  }

  // Create a new endpoint folder
  static async createEndpointFolder(
    folderData: Omit<EndpointFolder, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, ENDPOINT_FOLDERS_COLLECTION), {
        ...folderData,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating endpoint folder:", error);
      throw error;
    }
  }

  // Update an endpoint folder
  static async updateEndpointFolder(
    id: string,
    updates: Partial<Omit<EndpointFolder, "id" | "projectId" | "createdAt" | "updatedAt">>
  ): Promise<void> {
    try {
      const folderRef = doc(db, ENDPOINT_FOLDERS_COLLECTION, id);
      await updateDoc(folderRef, {
        ...updates,
        updatedAt: convertToTimestamp(new Date()),
      });
    } catch (error) {
      console.error("Error updating endpoint folder:", error);
      throw error;
    }
  }

  // Delete an endpoint folder
  static async deleteEndpointFolder(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ENDPOINT_FOLDERS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting endpoint folder:", error);
      throw error;
    }
  }
}