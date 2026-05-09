import React from 'react';
import { cn } from '../lib/utils';

interface BrutalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'yellow' | 'pink' | 'blue' | 'green';
}

const variants = {
  white: 'bg-white',
  yellow: 'bg-[#ffde59]',
  pink: 'bg-[#ff91ff]',
  blue: 'bg-[#7dd3fc]',
  green: 'bg-[#bbf7d0]',
};

export const BrutalCard: React.FC<BrutalCardProps> = ({ children, className, variant = 'white' }) => {
  return (
    <div className={cn('brutal-card p-6', variants[variant], className)}>
      {children}
    </div>
  );
};

export const BrutalButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }> = ({ 
  children, 
  className, 
  variant = 'white', 
  ...props 
}) => {
  return (
    <button 
      className={cn('brutal-button', variants[variant], className)} 
      {...props}
    >
      {children}
    </button>
  );
};
