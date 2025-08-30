import { useState, useEffect } from 'react';
import { AuthService, type AuthUser } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInAnonymously = async () => {
    try {
      setLoading(true);
      await AuthService.signInAnonymously();
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      await AuthService.signUp(email, password);
    } catch (error) {
      console.error('Error signing up:', error);
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await AuthService.signIn(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await AuthService.signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      await AuthService.signInWithFacebook();
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    try {
      setLoading(true);
      await AuthService.signInWithGitHub();
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      setLoading(false);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInAnonymously,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGitHub,
  };
};