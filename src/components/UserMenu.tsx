import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="flex items-center space-x-2"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <Icon icon="material-symbols:person" className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.displayName || user.email || 'Usuario'}
        </span>
        <Icon 
          icon={isOpen ? "material-symbols:expand-less" : "material-symbols:expand-more"} 
          className="h-4 w-4 text-gray-500 dark:text-gray-400" 
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Icon icon="material-symbols:logout" className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}