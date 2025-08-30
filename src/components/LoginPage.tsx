import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import Input from './Input';
import { Icon } from '@iconify/react';

export default function LoginPage() {
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signInWithFacebook, 
    signInWithGitHub,
    loading 
  } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al autenticar');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    setError('');
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'github':
          await signInWithGitHub();
          break;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : `Error al iniciar sesión con ${provider}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Iniciando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Icon icon="mdi:api" className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            API Tester
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Crea tu cuenta para empezar' : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div className="text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Icon icon="logos:google-icon" className="h-5 w-5 mr-2" />
            Continuar con Google
          </Button>

          <Button
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Icon icon="logos:facebook" className="h-5 w-5 mr-2" />
            Continuar con Facebook
          </Button>

          <Button
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Icon icon="logos:github-icon" className="h-5 w-5 mr-2" />
            Continuar con GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              O continúa con
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 text-sm"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}