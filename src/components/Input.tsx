import type { FC, InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
  variant?: 'default' | 'full-width';
}

const Input: FC<InputProps> = ({ 
  className = "", 
  variant = 'default',
  ...props 
}) => {
  const baseStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5";
  
  const variantStyles = {
    default: "",
    'full-width': "w-full"
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  return (
    <input
      className={combinedClassName}
      {...props}
    />
  );
};

export default Input;