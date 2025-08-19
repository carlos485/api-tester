import type { FC } from "react";
import Select, { type SelectOption } from "./Select";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestMethodSelectProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'minimal' | 'addon';
}

const httpMethodOptions: SelectOption[] = [
  {
    value: "GET",
    label: "GET",
    color: "text-green-600",
    badge: "Safe"
  },
  {
    value: "POST",
    label: "POST", 
    color: "text-yellow-600",
    badge: "Create"
  },
  {
    value: "PUT",
    label: "PUT",
    color: "text-blue-600",
    badge: "Update"
  },
  {
    value: "PATCH",
    label: "PATCH",
    color: "text-purple-600",
    badge: "Modify"
  },
  {
    value: "DELETE",
    label: "DELETE",
    color: "text-red-600",
    badge: "Remove"
  }
];

const RequestMethodSelect: FC<RequestMethodSelectProps> = ({
  value,
  onChange,
  className = "",
  disabled = false,
  variant = 'default'
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue as HttpMethod);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={httpMethodOptions}
      disabled={disabled}
      className={className}
      variant={variant}
      showColors={true}
    />
  );
};

export default RequestMethodSelect;