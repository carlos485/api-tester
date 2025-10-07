import { useState, useEffect } from 'react';
import { AuthService, type AuthUser } from '@/features/auth/services';

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
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGitHub,
  };
};