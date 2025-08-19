import type { FC } from "react";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestMethodSelectProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
  className?: string;
  disabled?: boolean;
}

const methodColors = {
  GET: "text-green-600",
  POST: "text-yellow-600", 
  PUT: "text-blue-600",
  PATCH: "text-purple-600",
  DELETE: "text-red-600"
};

const RequestMethodSelect: FC<RequestMethodSelectProps> = ({
  value,
  onChange,
  className = "",
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as HttpMethod);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block min-w-24 p-2.5 ${className}`}
    >
      <option value="GET" className={methodColors.GET}>
        GET
      </option>
      <option value="POST" className={methodColors.POST}>
        POST
      </option>
      <option value="PUT" className={methodColors.PUT}>
        PUT
      </option>
      <option value="PATCH" className={methodColors.PATCH}>
        PATCH
      </option>
      <option value="DELETE" className={methodColors.DELETE}>
        DELETE
      </option>
    </select>
  );
};

export default RequestMethodSelect;