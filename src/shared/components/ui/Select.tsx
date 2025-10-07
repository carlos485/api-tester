import { useState, useRef, useEffect } from "react";
import type { FC, ReactNode } from "react";
import { Icon } from "@iconify/react";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  badge?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "addon";
  showColors?: boolean;
}

const Select: FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  disabled = false,
  className = "",
  variant = "default",
  showColors = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement[]>([]);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
            return nextIndex;
          });
        }
        break;
    }
  };

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return {
          trigger:
            "bg-transparent border-0 focus:ring-0 focus:border-0 focus:outline-none min-w-20",
          dropdown: "mt-1 bg-white border border-gray-300 rounded-lg shadow-lg",
        };
      case "addon":
        return {
          trigger:
            "bg-transparent border-0 focus:ring-0 focus:border-0 focus:outline-none w-20",
          dropdown:
            "mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-32",
        };
      default:
        return {
          trigger:
            "bg-gray-50 border border-gray-300 focus:ring-gray-500 focus:border-gray-500 min-w-24",
          dropdown: "mt-1 bg-white border border-gray-300 rounded-lg shadow-lg",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          ${styles.trigger}
          ${
            variant === "addon" ? "" : "w-full"
          } px-2 py-2 text-left text-sm rounded-lg 
          flex items-center justify-between
          transition-colors duration-200
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-gray-100"
          }
          ${isOpen ? "ring-2 ring-gray-500" : ""}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span
            className={`truncate ${
              showColors && selectedOption?.color
                ? selectedOption.color
                : "text-gray-900"
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <Icon
          icon="heroicons:chevron-down-20-solid"
          className={`flex-shrink-0 w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          className={`absolute z-50 ${
            variant === "addon" ? "w-32" : "w-full"
          } ${styles.dropdown} max-h-60 overflow-auto`}
        >
          <div className="py-1">
            {options.map((option, index) => (
              <div
                key={option.value}
                ref={el => {
                  if (el) optionsRef.current[index] = el;
                }}
                onClick={() => handleOptionClick(option)}
                className={`
                  px-3 py-2 cursor-pointer flex items-center gap-2
                  transition-colors duration-150
                  ${
                    option.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }
                  ${focusedIndex === index ? "bg-gray-100" : ""}
                  ${
                    option.value === value
                      ? "bg-blue-50 border-r-2 border-blue-500"
                      : ""
                  }
                `}
              >
                {option.icon && (
                  <span className="flex-shrink-0">{option.icon}</span>
                )}
                <span
                  className={`flex-1 ${
                    showColors && option.color ? option.color : "text-gray-900"
                  }`}
                >
                  {option.label}
                </span>
                {option.value === value && (
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
