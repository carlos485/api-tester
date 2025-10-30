import { useRef, useEffect } from 'react';

interface VariableHighlightedInputProps {
  value: string;
  onChange: (value: string) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  hasEnvironment?: boolean;
}

/**
 * Input component that highlights variables in the format {{variable}} or ${variable}
 * with a chip-like appearance (gray-700 background, red text)
 */
const VariableHighlightedInput: React.FC<VariableHighlightedInputProps> = ({
  value,
  onChange,
  onPaste,
  placeholder = '',
  className = '',
  required = false,
  hasEnvironment = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Sync scroll position between input and highlight layer
  useEffect(() => {
    const handleScroll = () => {
      if (inputRef.current && highlightRef.current) {
        highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('scroll', handleScroll);
      return () => input.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Highlight variables in the text
  const highlightText = (text: string) => {
    if (!text) return null;

    // Match {{variable}} or ${variable}
    const parts = text.split(/(\{\{[^}]+\}\}|\$\{[^}]+\})/g);

    return parts.map((part, index) => {
      // Check if this part is a variable
      if (part.match(/^(\{\{[^}]+\}\}|\$\{[^}]+\})$/)) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-700 text-red-500 font-medium text-xs mx-0.5"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative flex-1 min-w-0">
      {/* Highlight layer (positioned behind input) */}
      <div
        ref={highlightRef}
        className={`absolute inset-0 pointer-events-none overflow-hidden text-sm py-2.5 whitespace-nowrap text-gray-900 dark:text-white ${hasEnvironment ? 'pr-3' : 'px-3'}`}
        style={{
          color: value && value.match(/(\{\{[^}]+\}\}|\$\{[^}]+\})/) ? 'transparent' : undefined
        }}
      >
        {highlightText(value)}
      </div>

      {/* Actual input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        className={`relative w-full text-sm border-0 focus:outline-none focus:ring-0 p-0 min-w-0 py-2.5 text-gray-900 dark:text-white caret-gray-900 dark:caret-white ${hasEnvironment ? 'pr-3' : 'px-3'} ${className}`}
        style={{
          background: 'transparent',
          color: value && value.match(/(\{\{[^}]+\}\}|\$\{[^}]+\})/) ? 'transparent' : undefined,
        }}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default VariableHighlightedInput;
