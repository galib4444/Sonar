/**
 * NeonCard Component
 * Card with neon glow animation based on priority level
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface NeonCardProps {
  priority: 'high' | 'medium' | 'low';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const priorityStyles = {
  high: {
    border: 'border-cyan-400',
    glow: 'neon-glow-cyan',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  medium: {
    border: 'border-purple-400',
    glow: 'neon-glow-purple',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  low: {
    border: 'border-gray-500',
    glow: 'neon-glow-dim',
    text: 'text-gray-400',
    bg: 'bg-gray-500/10',
  },
};

export function NeonCard({ priority, children, className, onClick }: NeonCardProps) {
  const styles = priorityStyles[priority];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl p-4 backdrop-blur-sm transition-all duration-300',
        'border-2',
        styles.border,
        styles.bg,
        styles.glow,
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function NeonBadge({ priority, children }: { priority: 'high' | 'medium' | 'low'; children: React.ReactNode }) {
  const styles = priorityStyles[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        styles.bg,
        styles.text,
        styles.border,
        'border'
      )}
    >
      {children}
    </span>
  );
}
