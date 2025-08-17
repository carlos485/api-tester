import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Project } from '../types/project';

// Tipo para proyecto en Firestore (con timestamps de Firebase)
interface FirestoreProject extends Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Conversión entre Project y FirestoreProject
const convertFromFirestore = (doc: { id: string; data: () => Record<string, unknown> }): Project => ({
  id: doc.id,
  name: doc.data().name,
  description: doc.data().description,
  icon: doc.data().icon,
  color: doc.data().color,
  environments: doc.data().environments || [],
  createdAt: doc.data().createdAt?.toDate() || new Date(),
  updatedAt: doc.data().updatedAt?.toDate() || new Date(),
});

const convertToFirestore = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Omit<FirestoreProject, 'id'> => ({
  ...project,
  userId,
  createdAt: serverTimestamp() as Timestamp,
  updatedAt: serverTimestamp() as Timestamp,
});

export class ProjectService {
  private static readonly COLLECTION_NAME = 'projects';

  // Crear un nuevo proyecto
  static async createProject(
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<string> {
    try {
      const firestoreData = convertToFirestore(projectData, userId);
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Obtener todos los proyectos del usuario
  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
        // orderBy('updatedAt', 'desc') // Temporalmente removido
      );
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(convertFromFirestore);
      // Ordenar en el cliente mientras tanto
      return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Error getting user projects:', error);
      throw error;
    }
  }

  // Suscribirse a cambios en tiempo real de los proyectos del usuario
  static subscribeToUserProjects(
    userId: string,
    callback: (projects: Project[]) => void
  ): () => void {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('userId', '==', userId)
      // orderBy('updatedAt', 'desc') // Temporalmente removido
    );

    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(convertFromFirestore);
      // Ordenar en el cliente mientras tanto
      const sortedProjects = projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      callback(sortedProjects);
    }, (error) => {
      console.error('Error in projects subscription:', error);
    });
  }

  // Actualizar un proyecto
  static async updateProject(
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const projectRef = doc(db, this.COLLECTION_NAME, projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Eliminar un proyecto
  static async deleteProject(projectId: string): Promise<void> {
    try {
      const projectRef = doc(db, this.COLLECTION_NAME, projectId);
      await deleteDoc(projectRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Actualizar ambientes de un proyecto
  static async updateProjectEnvironments(
    projectId: string,
    environments: Project['environments']
  ): Promise<void> {
    return this.updateProject(projectId, { environments });
  }
}