import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp } from 'lucide-react';
import { Goal, formatCurrency } from '@/lib/store';
import { ProgressBar } from './ProgressBar';
import { CategoryIcon } from './CategoryIcon';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  index?: number;
  onClick?: () => void;
}

export const GoalCard = ({ goal, index = 0, onClick }: GoalCardProps) => {
  const progress = (goal.savedAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.savedAmount;
  const isCompleted = progress >= 100;

  const getProgressMessage = () => {
    if (progress >= 100) return '🎉 Meta alcançada!';
    if (progress >= 75) return '💪 Quase lá!';
    if (progress >= 50) return '🚀 Metade do caminho!';
    if (progress >= 25) return '📈 Bom progresso!';
    return '🌱 Comece a economizar!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className={cn(
        'glass-card p-5 cursor-pointer transition-all duration-300',
        'hover:scale-[1.02]',
        isCompleted 
          ? 'border-2 border-success shadow-lg shadow-success/30 bg-success/5'
          : 'hover:shadow-glow-primary'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `hsl(var(--${goal.color}) / 0.1)` }}
          >
            <CategoryIcon 
              iconName={goal.icon} 
              color={goal.color}
              size="lg"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{goal.name}</h3>
            {goal.deadline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>
        <span className={cn(
          'text-xs font-bold px-2 py-1 rounded-full',
          isCompleted
            ? 'bg-success/20 text-success animate-pulse' 
            : 'bg-primary/10 text-primary'
        )}>
          {progress.toFixed(0)}%
        </span>
      </div>

      <ProgressBar 
        progress={progress} 
        variant={isCompleted ? 'success' : 'primary'} 
        size="md"
      />

      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-sm text-muted-foreground">Economizado</p>
          <p className="text-lg font-bold" style={{ color: `hsl(var(--${goal.color}))` }}>
            {formatCurrency(goal.savedAmount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Meta</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(goal.targetAmount)}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          {progress < 100 
            ? `Faltam ${formatCurrency(remaining)} • ${getProgressMessage()}`
            : getProgressMessage()
          }
        </p>
      </div>
    </motion.div>
  );
};
