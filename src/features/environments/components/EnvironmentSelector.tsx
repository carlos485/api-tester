import { useEffect, useMemo } from "react";
import type { Environment } from '@/features/environments/types';
import { NativeSelect, type NativeSelectOption } from '@/shared/components/ui';

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

  const options: NativeSelectOption[] = useMemo(() =>
    environments.map(env => ({
      value: env.id,
      label: env.name,
    })),
    [environments]
  );

  return (
    <NativeSelect
      value={selectedEnvironment?.id || ""}
      onChange={handleEnvironmentSelect}
      options={options}
      placeholder="No environment"
      title={selectedEnvironment?.name || "No environment"}
    />
  );
};

export default EnvironmentSelector;