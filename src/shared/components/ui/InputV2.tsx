import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";

interface InputV2Props {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  variant?: string;
  placeholder?: string;
  leftIcon?: string;
  rightIcon?: string;
}

export const InputV2: React.FC<InputV2Props> = ({
  value,
  variant = 'default',
  onChange,
  onSearch,
  placeholder = "Search",
  leftIcon,
  rightIcon,
}) => {
  const debounceTimerRef = useRef<number | null>(null);
  const baseStylesInput = "block transition-all duration-300 p-2.5 text-sm text-gray-900 border rounded-lg";

  const variantStyles: Record<string, string> = {
    default: "w-full bg-gray-50 border-gray-300 focus:ring-gray-500 dark:focus:ring-gray-300 focus:border-gray-300 dark:bg-gray-70 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:border-gray-500",
    'full-width': "w-full",
    ghost: "w-auto bg-transparent border-transparent font-semibold hover:bg-gray-50 focus:bg-gray-50 focus:ring-gray-300 focus:border-gray-300 focus:font-normal dark:hover:bg-gray-50 dark:focus:bg-gray-50 dark:focus:ring-gray-300 dark:focus:border-gray-300 dark:text-white",
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (onSearch) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch();
      }, 1000);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearch?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Icon
              icon={leftIcon}
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
            />
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseStylesInput} ${variantStyles[variant]} ${leftIcon ? 'ps-10' : 'ps-3'} ${rightIcon ? 'pe-10' : 'pe-3'}`}
          placeholder={placeholder}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
            <Icon
              icon={rightIcon}
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
            />
          </div>
        )}
      </div>
    </form>
  );
};
