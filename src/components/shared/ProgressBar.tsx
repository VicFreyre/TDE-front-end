import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const variantGradients = {
  primary: 'from-primary to-primary-glow',
  secondary: 'from-secondary to-secondary-glow',
  success: 'from-success to-emerald-400',
  warning: 'from-warning to-amber-400',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar = ({ 
  progress, 
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = true 
}: ProgressBarProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progresso</span>
          <span>{clampedProgress.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-muted overflow-hidden', sizeClasses[size])}>
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            variantGradients[variant]
          )}
        />
      </div>
    </div>
  );
};
