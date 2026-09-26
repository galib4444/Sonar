/**
 * Premium Gold Gradient Button Component
 * Black-Gold Theme
 */

import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function GoldButton({
  children,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}: GoldButtonProps) {
  const sizeClasses = {
    sm: 'px-6 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  };

  return (
    <button
      className={cn(
        variant === 'solid' ? 'btn-gold' : 'btn-gold-outline',
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
