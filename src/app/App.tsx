import { LoginPage } from "@/features/auth/components";
import { ApiTesterView } from "@/features/requests/components";
import { useAuth } from "@/features/auth/hooks";

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const { user, loading: authLoading } = useAuth();

  // Show loading while authenticating
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show the main API Tester view
  return <ApiTesterView />;
}

export default App;
