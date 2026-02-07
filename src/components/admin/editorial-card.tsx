'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EditorialCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'asymmetric' | 'highlighted';
  hover?: boolean;
}

/**
 * Editorial Card Component
 * Magazine-style card with optional asymmetric layout and editorial shadow
 *
 * Usage:
 * <EditorialCard variant="asymmetric">
 *   <EditorialCardHeader>Title</EditorialCardHeader>
 *   <EditorialCardContent>Content</EditorialCardContent>
 * </EditorialCard>
 */
export function EditorialCard({
  children,
  className,
  variant = 'default',
  hover = true
}: EditorialCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border-2 border-foreground/10 overflow-hidden',
        'transition-all duration-300',
        hover && 'hover:editorial-shadow hover:-translate-y-1',
        variant === 'asymmetric' && 'relative',
        variant === 'highlighted' && 'bg-accent/10 border-accent',
        className
      )}
    >
      {children}
    </div>
  );
}

interface EditorialCardHeaderProps {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}

export function EditorialCardHeader({
  children,
  className,
  accent = false
}: EditorialCardHeaderProps) {
  return (
    <div
      className={cn(
        'p-6 pb-4',
        accent && 'bg-accent/5 border-b-2 border-accent',
        className
      )}
    >
      {children}
    </div>
  );
}

interface EditorialCardTitleProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function EditorialCardTitle({
  children,
  className,
  size = 'md'
}: EditorialCardTitleProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl md:text-5xl',
  };

  return (
    <h3
      className={cn(
        'font-display font-bold tracking-tight text-foreground',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </h3>
  );
}

interface EditorialCardContentProps {
  children: ReactNode;
  className?: string;
}

export function EditorialCardContent({ children, className }: EditorialCardContentProps) {
  return (
    <div className={cn('p-6 pt-4', className)}>
      {children}
    </div>
  );
}

interface EditorialCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function EditorialCardFooter({ children, className }: EditorialCardFooterProps) {
  return (
    <div className={cn('p-6 pt-0 flex gap-3', className)}>
      {children}
    </div>
  );
}
