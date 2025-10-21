import { useEffect } from "react";
import type { Environment } from '@/features/environments/types';

interface EnvironmentSelectorProps {
  selectedEnvironment: Environment | null;
  onEnvironmentChange: (environment: Environment | null) => void;
  environments: Environment[];
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  selectedEnvironment,
  onEnvironmentChange,
  environments = [],
}) => {
  const handleEnvironmentSelect = (envId: string) => {
    if (envId === "") {
      onEnvironmentChange(null);
    } else {
      const env = environments.find(e => e.id === envId);
      onEnvironmentChange(env || null);
    }
  };

  // Auto-select first environment if available and none is selected
  useEffect(() => {
    if (!selectedEnvironment && environments.length > 0) {
      onEnvironmentChange(environments[0]);
    }
  }, [environments, selectedEnvironment, onEnvironmentChange]);

  return (
    <div className="relative min-w-0 flex-shrink-0">
      <select
        id="environment-select"
        value={selectedEnvironment?.id || ""}
        onChange={(e) => handleEnvironmentSelect(e.target.value)}
        className="block min-w-[150px] max-w-[300px] w-auto p-2 pr-8 text-sm text-gray-900 border border-transparent rounded-lg bg-transparent hover:bg-gray-50 focus:ring-gray-300 focus:border-gray-300 dark:hover:bg-gray-50 dark:placeholder-gray-400 dark:text-white dark:focus:bg-gray-50 dark:focus:ring-gray-300 dark:focus:border-gray-300 cursor-pointer transition-all duration-300 appearance-none truncate"
        title={selectedEnvironment?.name || "No environment"}
      >
        <option value="">No environment</option>
        {environments.map(env => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EnvironmentSelector;