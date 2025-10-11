import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;

}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search",
}) => {
  const debounceTimerRef = useRef<number | null>(null);

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
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Icon
            icon="line-md:search"
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block transition-all duration-300 w-full p-2.5 ps-10 pe-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500  dark:focus:ring-gray-300 focus:border-gray-500 dark:bg-gray-70 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
          <Icon
            icon="line-md:plus"
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
          />
        </div>
      </div>
    </form>
  );
};
