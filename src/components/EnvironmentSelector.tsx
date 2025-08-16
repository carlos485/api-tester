import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Environment } from "../types/project";

interface EnvironmentSelectorProps {
  selectedEnvironment: Environment | null;
  onEnvironmentChange: (environment: Environment | null) => void;
  environments?: Environment[];
}

const defaultEnvironments: Environment[] = [
  { id: "dev", name: "Development", baseUrl: "http://localhost:3000" },
  { id: "staging", name: "Staging", baseUrl: "https://staging.example.com" },
  { id: "prod", name: "Production", baseUrl: "https://api.example.com" },
];

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  selectedEnvironment,
  onEnvironmentChange,
  environments: projectEnvironments = [],
}) => {
  const [environments, setEnvironments] = useState<Environment[]>(
    projectEnvironments.length > 0 ? projectEnvironments : defaultEnvironments
  );
  const [showManager, setShowManager] = useState(false);
  const [newEnv, setNewEnv] = useState({ name: "", baseUrl: "" });

  const handleEnvironmentSelect = (envId: string) => {
    if (envId === "") {
      onEnvironmentChange(null);
    } else {
      const env = environments.find(e => e.id === envId);
      onEnvironmentChange(env || null);
    }
  };

  const handleAddEnvironment = () => {
    if (newEnv.name.trim() && newEnv.baseUrl.trim()) {
      const newEnvironment: Environment = {
        id: Date.now().toString(),
        name: newEnv.name.trim(),
        baseUrl: newEnv.baseUrl.trim(),
      };
      setEnvironments([...environments, newEnvironment]);
      setNewEnv({ name: "", baseUrl: "" });
    }
  };

  const handleDeleteEnvironment = (envId: string) => {
    setEnvironments(environments.filter(env => env.id !== envId));
    if (selectedEnvironment?.id === envId) {
      onEnvironmentChange(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <select
          value={selectedEnvironment?.id || ""}
          onChange={e => handleEnvironmentSelect(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 min-w-[120px]"
        >
          <option value="">No Environment</option>
          {environments.map(env => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowManager(!showManager)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Manage Environments"
        >
          <Icon icon="material-symbols:settings" className="h-4 w-4" />
        </button>
      </div>

      {showManager && (
        <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-3">Manage Environments</h3>
          
          <div className="space-y-2 mb-4">
            {environments.map(env => (
              <div key={env.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{env.name}</div>
                  <div className="text-xs text-gray-600">{env.baseUrl}</div>
                </div>
                <button
                  onClick={() => handleDeleteEnvironment(env.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                  title="Delete Environment"
                >
                  <Icon icon="material-symbols:delete" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Add New Environment</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Environment Name"
                value={newEnv.name}
                onChange={e => setNewEnv({ ...newEnv, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
              />
              <input
                type="url"
                placeholder="Base URL (e.g., https://api.example.com)"
                value={newEnv.baseUrl}
                onChange={e => setNewEnv({ ...newEnv, baseUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddEnvironment}
                  disabled={!newEnv.name.trim() || !newEnv.baseUrl.trim()}
                  className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowManager(false)}
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentSelector;