import type { FC, InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
  variant?: 'default' | 'full-width';
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

const Input: FC<InputProps> = ({ 
  className = "", 
  variant = 'default',
  leftAddon,
  rightAddon,
  ...props 
}) => {
  const hasAddons = leftAddon || rightAddon;
  
  const baseInputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 p-2.5";
  
  const variantStyles = {
    default: "",
    'full-width': "w-full"
  };

  if (hasAddons) {
    // Input with addons - wrapped in a container
    const containerClassName = `flex items-center bg-gray-50 border border-gray-300 rounded-lg focus-within:ring-gray-500 focus-within:border-gray-500 ${variantStyles[variant]} ${className}`.trim();
    
    const inputClassName = `bg-transparent border-0 text-gray-900 text-sm focus:ring-0 focus:border-0 focus:outline-none flex-1 p-2.5 ${
      leftAddon ? 'rounded-r-lg' : 'rounded-lg'
    } ${
      rightAddon ? 'rounded-l-lg' : 'rounded-lg'
    }`.trim();

    return (
      <div className={containerClassName}>
        {leftAddon && (
          <div className="flex items-center px-3 border-r border-gray-300 bg-gray-100 rounded-l-lg">
            {leftAddon}
          </div>
        )}
        <input
          className={inputClassName}
          {...props}
        />
        {rightAddon && (
          <div className="flex items-center px-3 border-l border-gray-300 bg-gray-100 rounded-r-lg">
            {rightAddon}
          </div>
        )}
      </div>
    );
  }

  // Regular input without addons
  const inputClassName = `${baseInputStyles} rounded-lg block ${variantStyles[variant]} ${className}`.trim();

  return (
    <input
      className={inputClassName}
      {...props}
    />
  );
};

export default Input;