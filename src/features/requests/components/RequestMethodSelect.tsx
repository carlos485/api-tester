import type { FC } from "react";
import type { HttpMethod } from "@/shared/types";

interface RequestMethodSelectProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'minimal' | 'addon';
}

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-green-600 dark:text-green-400";
    case "POST":
      return "text-blue-600 dark:text-blue-400";
    case "PUT":
      return "text-orange-600 dark:text-orange-400";
    case "PATCH":
      return "text-purple-600 dark:text-purple-400";
    case "DELETE":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

const RequestMethodSelect: FC<RequestMethodSelectProps> = ({
  value,
  onChange,
  className = "",
  disabled = false,
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue as HttpMethod);
  };

  return (
    <div className="relative min-w-0 flex-shrink-0">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className={`block min-w-[100px] max-w-[150px] w-auto p-2 pr-8 text-sm font-semibold border border-transparent rounded-lg bg-transparent hover:bg-gray-50 focus:ring-gray-300 focus:border-gray-300 dark:hover:bg-gray-60 dark:focus:bg-gray-60 dark:focus:ring-gray-300 dark:focus:border-gray-300 cursor-pointer transition-all duration-300 appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${getMethodColor(value)} ${className}`}
      >
        <option value="GET" className="text-green-600 font-semibold">GET</option>
        <option value="POST" className="text-blue-600 font-semibold">POST</option>
        <option value="PUT" className="text-orange-600 font-semibold">PUT</option>
        <option value="PATCH" className="text-purple-600 font-semibold">PATCH</option>
        <option value="DELETE" className="text-red-600 font-semibold">DELETE</option>
      </select>
    </div>
  );
};

export default RequestMethodSelect;