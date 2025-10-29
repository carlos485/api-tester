import React from 'react';

export interface NativeSelectOption {
  value: string;
  label: string;
}

interface NativeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: NativeSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}

const NativeSelect: React.FC<NativeSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  disabled = false,
  title,
}) => {
  return (
    <div className="relative min-w-0 flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title={title}
        className={`block min-w-[150px] max-w-[300px] w-auto p-2 pr-8 text-sm text-gray-900 border border-transparent rounded-lg bg-transparent hover:bg-gray-50 focus:ring-gray-300 focus:border-gray-300 dark:hover:bg-gray-60 dark:placeholder-gray-400 dark:text-white dark:focus:bg-gray-60 dark:focus:ring-gray-300 dark:focus:border-gray-300 cursor-pointer transition-all duration-300 appearance-none truncate disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NativeSelect;
