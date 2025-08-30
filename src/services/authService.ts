import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export class AuthService {
  // Convertir User de Firebase a AuthUser
  private static convertUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAnonymous: user.isAnonymous,
    };
  }

  // Iniciar sesión anónima (para empezar rápido)
  static async signInAnonymously(): Promise<AuthUser> {
    try {
      const userCredential = await signInAnonymously(auth);
      return this.convertUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }

  // Registrarse con email y password
  static async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return this.convertUser(userCredential.user);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Iniciar sesión con email y password
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.convertUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Cerrar sesión
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Suscribirse a cambios de autenticación
  static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(this.convertUser(user));
      } else {
        callback(null);
      }
    });
  }

  // Iniciar sesión con Google
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return this.convertUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Iniciar sesión con Facebook
  static async signInWithFacebook(): Promise<AuthUser> {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return this.convertUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      throw error;
    }
  }

  // Iniciar sesión con GitHub
  static async signInWithGitHub(): Promise<AuthUser> {
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return this.convertUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  static getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? this.convertUser(user) : null;
  }
}