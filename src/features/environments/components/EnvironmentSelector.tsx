import { useEffect } from "react";
import { Select } from "flowbite-react";
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
    <Select
      value={selectedEnvironment?.id || ""}
      onChange={e => handleEnvironmentSelect(e.target.value)}
      disabled={environments.length === 0}
      sizing="sm"
      className="min-w-[150px]"
    >
      <option value="">No Environment</option>
      {environments.map(env => (
        <option key={env.id} value={env.id}>
          {env.name}
        </option>
      ))}
    </Select>
  );
};

export default EnvironmentSelector;