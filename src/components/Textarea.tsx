interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  maxLength?: number;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  className = "",
  error,
  maxLength,
}) => {
  const baseClasses =
    "bg-gray-50 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-60 transition-colors resize-vertical";
  const normalClasses =
    "border-gray-300 dark:border-gray-500 dark:bg-[#303033] dark:text-white";
  const errorClasses =
    "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500";

  const textareaClasses = `${baseClasses} ${
    error ? errorClasses : normalClasses
  } ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={textareaClasses}
      />
      {maxLength && (
        <div className="flex justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {value.length}/{maxLength}
          </span>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Textarea;
