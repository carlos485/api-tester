import { useEffect, useRef, useState } from "react";

interface TextareaV2Props {
    value: string;
    onChange: (value: string | React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
    placeholder?: string;
    rows?: number;
    className?: string;
}

export const TextareaV2: React.FC<TextareaV2Props> = ({
    value,
    variant = 'default',
    size = 'md',
    onChange,
    placeholder = "Enter text...",
    rows = 3,
    disabled = false,
    className = "",
}) => {
    const spanRef = useRef<HTMLSpanElement | null>(null);
    const [textareaWidth, setTextareaWidth] = useState<number>(200);
    const baseStylesTextarea = "block transition-all duration-300 p-2.5 text-gray-900 border rounded-lg resize-none";

    const variantStyles: Record<string, string> = {
        default: "w-full bg-gray-50 dark:bg-gray-60 border-gray-300 focus:ring-gray-500 dark:focus:ring-gray-300 focus:border-gray-300 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:border-gray-500",
        'full-width': "w-full",
        ghost: "w-auto bg-transparent border-transparent font-semibold hover:bg-gray-50 focus:bg-gray-50 focus:ring-gray-500 focus:border-gray-300 dark:hover:bg-gray-60 dark:focus:bg-gray-60 dark:focus:ring-gray-300 dark:focus:border-gray-300 dark:text-white",
    };

    const sizeStyles: Record<string, string> = {
        sm: "text-sm",
        md: "text-md",
        lg: "text-lg",
        xl: "text-xl",
    };

    // Calculate width based on content for ghost variant
    useEffect(() => {
        if (variant === 'ghost' && spanRef.current) {
            const width = spanRef.current.offsetWidth;
            setTextareaWidth(Math.max(width + 30, 100)); // Add padding and set minimum width
        }
    }, [value, variant]);

    return (
        <div className="relative">
            {/* Hidden span to measure text width for ghost variant */}
            {variant === 'ghost' && (
                <span
                    ref={spanRef}
                    className={`${sizeStyles[size]} font-semibold invisible absolute whitespace-pre`}
                    aria-hidden="true"
                >
                    {value || placeholder}
                </span>
            )}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${sizeStyles[size]} ${baseStylesTextarea} ${variantStyles[variant]} ${className}`}
                style={variant === 'ghost' ? { width: `${textareaWidth}px` } : undefined}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
            />
        </div>
    );
};

export default TextareaV2;
