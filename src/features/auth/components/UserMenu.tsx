import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '@/features/auth/hooks';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative min-w-0 flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[150px] max-w-[300px] w-auto p-2 pr-8 text-sm text-gray-900 border border-transparent rounded-lg bg-transparent hover:bg-gray-50 focus:ring-gray-300 focus:border-gray-300 dark:hover:bg-gray-60 dark:text-white dark:focus:bg-gray-60 dark:focus:ring-gray-300 dark:focus:border-gray-300 cursor-pointer transition-all duration-300"
      >
        {user.photoURL && !imageError ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="h-6 w-6 rounded-full flex-shrink-0"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-xs">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium truncate">
          {user.displayName || user.email || 'Usuario'}
        </span>
        <Icon
          icon={isOpen ? "material-symbols:expand-less" : "material-symbols:expand-more"}
          className="h-4 w-4 flex-shrink-0 ml-auto"
        />
      </button>

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