import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "./Button";
import { Icon } from "@iconify/react";

export default function LoginPage() {
  const { signInWithGoogle, signInWithFacebook, signInWithGitHub, loading } =
    useAuth();

  const [error, setError] = useState("");

  const socialProviders = [
    {
      id: "google",
      name: "Google",
      icon: "logos:google-icon",
      handler: signInWithGoogle,
      label: "Continuar con Google"
    },
    {
      id: "facebook", 
      name: "Facebook",
      icon: "logos:facebook",
      handler: signInWithFacebook,
      label: "Continuar con Facebook"
    },
    {
      id: "github",
      name: "GitHub", 
      icon: "uil:github",
      handler: signInWithGitHub,
      label: "Continuar con GitHub"
    }
  ];

  const handleSocialLogin = async (handler: () => Promise<void>, providerName: string) => {
    setError("");
    try {
      await handler();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : `Error al iniciar sesión con ${providerName}`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Iniciando sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Icon
              icon="mdi:api"
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            API Tester
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión en tu cuenta
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
          {socialProviders.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => handleSocialLogin(provider.handler, provider.name)}
              variant="light"
              disabled={loading}
              className="w-full shadow-sm"
            >
              <Icon icon={provider.icon} className="h-5 w-5 mr-2" />
              {provider.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
