import { motion } from 'framer-motion';
import { Trash2, CreditCard, Banknote } from 'lucide-react';
import { Expense, Category, formatCurrency, formatDate, getPaymentMethodLabel, getPaymentMethodColor } from '@/lib/store';
import { CategoryIcon } from './CategoryIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpenseItemProps {
  expense: Expense;
  category?: Category;
  index?: number;
  onDelete?: () => void;
  showPaymentMethod?: boolean;
}

export const ExpenseItem = ({ 
  expense, 
  category, 
  index = 0,
  onDelete,
  showPaymentMethod = false
}: ExpenseItemProps) => {
  const PaymentIcon = expense.paymentMethod === 'cash' ? Banknote : CreditCard;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'flex items-center justify-between p-4 rounded-xl',
        'bg-card/50 hover:bg-card transition-colors group'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2.5 rounded-xl transition-transform group-hover:scale-110',
          category ? `bg-${category.color}/10` : 'bg-muted'
        )} style={{ backgroundColor: category ? `hsl(var(--${category.color}) / 0.1)` : undefined }}>
          <CategoryIcon 
            iconName={category?.icon || 'Receipt'} 
            color={category?.color || 'muted-foreground'}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">
              {category?.name || 'Sem categoria'}
            </p>
            {showPaymentMethod && (
              <span 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ 
                  backgroundColor: `${getPaymentMethodColor(expense.paymentMethod)}15`,
                  color: getPaymentMethodColor(expense.paymentMethod)
                }}
              >
                <PaymentIcon className="w-3 h-3" />
                {getPaymentMethodLabel(expense.paymentMethod)}
              </span>
            )}
          </div>
          {expense.description && (
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {expense.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(expense.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-bold text-foreground">
          -{formatCurrency(expense.amount)}
        </span>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};