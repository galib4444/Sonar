/**
 * Premium Input Component
 * Black-Gold Theme with glassmorphism
 */

import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gold-200 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn('input-premium', error && 'border-red-500', className)}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';

interface PremiumTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gold-200 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn('input-premium resize-none', error && 'border-red-500', className)}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

PremiumTextarea.displayName = 'PremiumTextarea';
