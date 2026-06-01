import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  delay?: number;
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
};

const iconBgStyles = {
  default: 'bg-muted',
  primary: 'bg-primary/10',
  secondary: 'bg-secondary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
};

export const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  trend,
  variant = 'default',
  delay = 0 
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', iconBgStyles[variant])}>
          <Icon className={cn('w-5 h-5', variantStyles[variant])} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend.isPositive 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={cn('text-2xl font-bold', variantStyles[variant])}>{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
};
