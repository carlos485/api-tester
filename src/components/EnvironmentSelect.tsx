import type { FC } from "react";
import Select, { type SelectOption } from "./Select";

export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  description?: string;
}

interface EnvironmentSelectProps {
  value: string;
  onChange: (environmentId: string) => void;
  environments: Environment[];
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'minimal' | 'addon';
  placeholder?: string;
}

const EnvironmentSelect: FC<EnvironmentSelectProps> = ({
  value,
  onChange,
  environments,
  className = "",
  disabled = false,
  variant = 'default',
  placeholder = "Select environment..."
}) => {
  const environmentOptions: SelectOption[] = environments.map(env => ({
    value: env.id,
    label: env.name,
    badge: env.baseUrl.replace(/^https?:\/\//, ''), // Remove protocol for cleaner display
    icon: (
      <div className={`w-2 h-2 rounded-full ${
        env.name.toLowerCase().includes('prod') ? 'bg-red-500' :
        env.name.toLowerCase().includes('staging') ? 'bg-yellow-500' :
        env.name.toLowerCase().includes('dev') ? 'bg-green-500' :
        'bg-blue-500'
      }`} />
    )
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={environmentOptions}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      variant={variant}
      showColors={false}
    />
  );
};

export default EnvironmentSelect;