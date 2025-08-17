interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "url" | "number";
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  autoFocus = false,
  className = "",
  error,
}) => {
  const baseClasses =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors";
  const normalClasses =
    "border-gray-300 dark:border-gray-500 dark:bg-[#303033] dark:text-white";
  const errorClasses =
    "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500";

  const inputClasses = `${baseClasses} ${
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
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        className={inputClasses}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
