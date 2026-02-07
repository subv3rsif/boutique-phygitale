'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatDisplayProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  color?: 'terracotta' | 'sage' | 'mustard' | 'charcoal';
  className?: string;
}

/**
 * Stat Display Component
 * Editorial-style large number display for dashboard metrics
 *
 * Usage:
 * <StatDisplay
 *   label="Chiffre d'Affaires"
 *   value="12 450€"
 *   description="Ce mois"
 *   icon={TrendingUp}
 *   color="terracotta"
 * />
 */
export function StatDisplay({
  label,
  value,
  description,
  icon: Icon,
  trend,
  color = 'terracotta',
  className
}: StatDisplayProps) {
  const colorClasses = {
    terracotta: 'text-primary',
    sage: 'text-secondary',
    mustard: 'text-accent',
    charcoal: 'text-foreground',
  };

  const bgClasses = {
    terracotta: 'bg-primary/5',
    sage: 'bg-secondary/5',
    mustard: 'bg-accent/5',
    charcoal: 'bg-foreground/5',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border-2 border-foreground/10',
        'bg-card p-8 transition-all duration-300',
        'hover:editorial-shadow hover:-translate-y-1',
        className
      )}
    >
      {/* Background Pattern */}
      <div
        className={cn(
          'absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          bgClasses[color]
        )}
      />

      {/* Content */}
      <div className="relative">
        {/* Icon & Label */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
          {Icon && (
            <div className={cn('rounded-lg p-2', bgClasses[color])}>
              <Icon className={cn('h-5 w-5', colorClasses[color])} />
            </div>
          )}
        </div>

        {/* Large Value */}
        <div className={cn('mb-2 font-display text-6xl font-bold tracking-tight', colorClasses[color])}>
          {value}
        </div>

        {/* Description or Trend */}
        {(description || trend) && (
          <div className="flex items-center gap-2">
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Stat Display
 * Smaller version for secondary metrics
 */
interface CompactStatProps {
  label: string;
  value: string | number;
  color?: 'terracotta' | 'sage' | 'mustard' | 'charcoal';
}

export function CompactStat({ label, value, color = 'charcoal' }: CompactStatProps) {
  const colorClasses = {
    terracotta: 'text-primary',
    sage: 'text-secondary',
    mustard: 'text-accent',
    charcoal: 'text-foreground',
  };

  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground/10 py-3 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className={cn('font-display text-2xl font-bold', colorClasses[color])}>
        {value}
      </span>
    </div>
  );
}
