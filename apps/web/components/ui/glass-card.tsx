/**
 * Premium Glassmorphism Card Component
 * Black-Gold Theme with transparent glassmorphism effects
 */

import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'cream';
  hover?: boolean;
}

export function GlassCard({ children, className, variant = 'default', hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        variant === 'cream' ? 'glass-card-cream' : 'glass-card',
        hover && 'card-hover',
        className
      )}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <GlassCard variant="cream" hover className={cn('p-8', className)}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
    </GlassCard>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  className?: string;
}

export function StepCard({ number, title, description, className }: StepCardProps) {
  return (
    <div className={cn('text-center', className)}>
      <div className="btn-gold w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-gold">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gold-200 mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
