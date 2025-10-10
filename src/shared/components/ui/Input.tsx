import type { FC, InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
  variant?: 'default' | 'full-width';
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  label?: string;
  error?: string;
}

const Input: FC<InputProps> = ({
  className = "",
  variant = 'default',
  leftAddon,
  rightAddon,
  label,
  error,
  ...props
}) => {
  const hasAddons = leftAddon || rightAddon;

  const baseInputStyles = "bg-gray-50 border text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors p-2.5 dark:bg-gray-70 dark:text-white";
  const normalBorderStyles = "border-gray-300 dark:border-gray-500";
  const errorBorderStyles = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500";

  const variantStyles = {
    default: "",
    'full-width': "w-full"
  };

  const renderInput = () => {
    if (hasAddons) {
      // Input with addons - wrapped in a container
      const containerClassName = `flex items-center bg-gray-50 dark:bg-gray-70 border ${error ? errorBorderStyles : normalBorderStyles} rounded-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500 transition-colors ${variantStyles[variant]} ${className}`.trim();

      const inputClassName = `bg-transparent border-0 text-gray-900 dark:text-white text-sm focus:ring-0 focus:border-0 focus:outline-none flex-1 p-2.5 ${
        leftAddon ? 'rounded-r-lg' : 'rounded-lg'
      } ${
        rightAddon ? 'rounded-l-lg' : 'rounded-lg'
      }`.trim();

      return (
        <div className={containerClassName}>
          {leftAddon && (
            <div className="flex items-center px-3 border-r border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 rounded-l-lg">
              {leftAddon}
            </div>
          )}
          <input
            className={inputClassName}
            {...props}
          />
          {rightAddon && (
            <div className="flex items-center px-3 border-l border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 rounded-r-lg">
              {rightAddon}
            </div>
          )}
        </div>
      );
    }

    // Regular input without addons
    const inputClassName = `${baseInputStyles} ${error ? errorBorderStyles : normalBorderStyles} rounded-lg block ${variantStyles[variant]} ${className}`.trim();

    return (
      <input
        className={inputClassName}
        {...props}
      />
    );
  };

  // Wrap with label if provided
  if (label) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        {renderInput()}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  return renderInput();
};

export default Input;