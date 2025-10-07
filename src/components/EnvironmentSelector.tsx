import { useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Environment } from "../types/project";

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
    <div className="flex items-center gap-2">
      <Icon icon="material-symbols:cloud" className="h-4 w-4 text-gray-600" />
      <select
        value={selectedEnvironment?.id || ""}
        onChange={e => handleEnvironmentSelect(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 min-w-[150px]"
        disabled={environments.length === 0}
      >
        <option value="">No Environment</option>
        {environments.map(env => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
      {selectedEnvironment && (
        <span className="text-xs text-gray-500 truncate max-w-xs" title={selectedEnvironment.baseUrl}>
          {selectedEnvironment.baseUrl}
        </span>
      )}
    </div>
  );
};

export default EnvironmentSelector;