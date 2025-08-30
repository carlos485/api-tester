import { Icon } from "@iconify/react";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: string;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "danger" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  icon,
  iconPosition = "left",
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
}) => {
  const baseClasses =
    "transition-colors duration-300 inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-[#3b434b] hover:bg-[#4e5964]/90 text-white focus:ring-[#24292F]/50 dark:hover:bg-[#5d6976]/90 dark:focus:ring-[#050708]/30",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
    danger:
      "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:bg-red-300",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300 disabled:text-gray-400",
    light:
      "bg-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 rounded-lg text-gray-900 border-gray-300",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  const iconElement = icon && <Icon icon={icon} className={iconSize[size]} />;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {icon && iconPosition === "left" && iconElement}
      {children}
      {icon && iconPosition === "right" && iconElement}
    </button>
  );
};

export default Button;
