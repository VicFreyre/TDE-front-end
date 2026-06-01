// ============================================
// MASCOT INSIGHTS - MODAL DE INSIGHTS FINANCEIROS
// ============================================

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  PiggyBank,
  Wallet,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useWishboard } from '@/hooks/useWishboard';
import { formatCurrency } from '@/lib/store';

interface MascotInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  mascotImage: string;
  mascotAlt: string;
  mascotMood: 'happy' | 'neutral' | 'sad';
}

export const MascotInsights: React.FC<MascotInsightsProps> = ({
  isOpen,
  onClose,
  mascotImage,
  mascotAlt,
  mascotMood,
}) => {
  const { 
    expenses, 
    incomes, 
    goals, 
    categories, 
    currentBalance,
    getMonthlyExpenses,
    getExpensesByCategory,
  } = useWishboard();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Calcular gastos do mês atual
  const currentMonthExpenses = useMemo(() => 
    getMonthlyExpenses(currentYear, currentMonth),
    [currentYear, currentMonth, getMonthlyExpenses]
  );

  // Calcular receitas do mês atual
  const currentMonthIncomes = useMemo(() => {
    return incomes.filter(i => {
      const date = new Date(i.date);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    });
  }, [incomes, currentYear, currentMonth]);

  // Total de gastos e receitas do mês
  const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomesThisMonth = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);

  // Porcentagem de gasto das entradas no mês atual
  const spendingPercentageThisMonth = totalIncomesThisMonth > 0 
    ? (totalExpensesThisMonth / totalIncomesThisMonth) * 100 
    : 0;

  // Calcular média de gastos/receitas dos últimos meses
  const monthlyAverages = useMemo(() => {
    const months: { expenses: number; incomes: number }[] = [];
    
    for (let i = 1; i <= 6; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      const monthExpenses = getMonthlyExpenses(year, month);
      const monthIncomes = incomes.filter(inc => {
        const date = new Date(inc.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });
      
      months.push({
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
        incomes: monthIncomes.reduce((sum, i) => sum + i.amount, 0),
      });
    }
    
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
    const totalIncomes = months.reduce((sum, m) => sum + m.incomes, 0);
    const count = months.filter(m => m.expenses > 0 || m.incomes > 0).length || 1;
    
    return {
      avgExpenses: totalExpenses / count,
      avgIncomes: totalIncomes / count,
      avgSpendingPercentage: totalIncomes > 0 ? (totalExpenses / totalIncomes) * 100 : 0,
    };
  }, [currentMonth, currentYear, getMonthlyExpenses, incomes]);

  // Gap financeiro (quanto está devendo - saldo negativo)
  const financialGap = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  const hasDebt = currentBalance < 0;

  // Categoria com mais gastos no mês
  const topCategory = useMemo(() => {
    const categoryBreakdown = getExpensesByCategory(currentMonthExpenses);
    return categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
  }, [currentMonthExpenses, getExpensesByCategory]);

  // Progresso das metas
  const goalsProgress = useMemo(() => {
    if (goals.length === 0) return { total: 0, percentage: 0 };
    
    const totalProgress = goals.reduce((sum, g) => {
      const progress = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
      return sum + progress;
    }, 0);
    
    return {
      total: goals.length,
      percentage: totalProgress / goals.length,
    };
  }, [goals]);

  // Mensagem baseada no humor do mascote
  const mascotMessage = useMemo(() => {
    switch (mascotMood) {
      case 'happy':
        return {
          title: 'Excelente trabalho! 🎉',
          subtitle: 'Suas finanças estão indo muito bem!',
          color: 'text-green-400',
          bgGradient: 'from-green-500/20 to-emerald-500/10',
          borderColor: 'border-green-500/30',
        };
      case 'neutral':
        return {
          title: 'Vamos melhorar! 💪',
          subtitle: 'Algumas dicas para otimizar suas finanças',
          color: 'text-amber-400',
          bgGradient: 'from-amber-500/20 to-yellow-500/10',
          borderColor: 'border-amber-500/30',
        };
      case 'sad':
        return {
          title: 'Atenção necessária! ⚠️',
          subtitle: 'Vamos ajustar suas finanças juntos',
          color: 'text-red-400',
          bgGradient: 'from-red-500/20 to-rose-500/10',
          borderColor: 'border-red-500/30',
        };
    }
  }, [mascotMood]);

  // Insight sobre o gasto
  const spendingInsight = useMemo(() => {
    if (spendingPercentageThisMonth <= 50) {
      return {
        status: 'excellent',
        icon: TrendingUp,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        message: 'Você está gastando pouco do que ganha! Continue assim!',
      };
    } else if (spendingPercentageThisMonth <= 70) {
      return {
        status: 'good',
        icon: Minus,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        message: 'Gasto moderado. Tente reduzir um pouco para poupar mais.',
      };
    } else if (spendingPercentageThisMonth <= 100) {
      return {
        status: 'warning',
        icon: TrendingDown,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        message: 'Cuidado! Você está gastando quase tudo que ganha.',
      };
    } else {
      return {
        status: 'critical',
        icon: AlertCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        message: 'Alerta! Você está gastando mais do que ganha!',
      };
    }
  }, [spendingPercentageThisMonth]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[hsl(240,10%,6%)] border border-[hsl(240,10%,15%)] rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com Mascote */}
            <div className={`relative p-6 bg-gradient-to-br ${mascotMessage.bgGradient} border-b ${mascotMessage.borderColor}`}>
              {/* Botão Fechar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-4">
                {/* Mascote */}
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 3, 0, -3, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-110" />
                  <img
                    src={mascotImage}
                    alt={mascotAlt}
                    className="w-24 h-24 relative z-10 drop-shadow-2xl"
                  />
                </motion.div>

                {/* Título */}
                <div className="flex-1">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-2xl font-bold ${mascotMessage.color}`}
                  >
                    {mascotMessage.title}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-400 text-sm mt-1"
                  >
                    {mascotMessage.subtitle}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Conteúdo dos Insights */}
            <div className="p-6 space-y-5">
              {/* Insight 1: Resumo do mês - PRIMEIRO */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Entradas do mês</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncomesThisMonth)}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDown className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-gray-400">Saídas do mês</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpensesThisMonth)}</p>
                </div>
              </motion.div>

              {/* Insight 2: Porcentagem de Gasto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-4 rounded-2xl ${spendingInsight.bg} border border-white/5`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${spendingInsight.bg}`}>
                    <spendingInsight.icon className={`w-5 h-5 ${spendingInsight.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm mb-1">Relação Receita × Gasto</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-3xl font-bold ${spendingInsight.color}`}>
                        {spendingPercentageThisMonth.toFixed(0)}%
                      </span>
                      <span className="text-gray-500 text-sm">do que ganhou este mês</span>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(spendingPercentageThisMonth, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          spendingPercentageThisMonth <= 50 ? 'bg-green-500' :
                          spendingPercentageThisMonth <= 70 ? 'bg-amber-500' :
                          spendingPercentageThisMonth <= 100 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    
                    <p className="text-gray-400 text-xs">{spendingInsight.message}</p>
                    
                    {/* Comparação com média */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Média dos últimos meses:</span>
                      <span className="text-gray-300 font-medium">
                        {monthlyAverages.avgSpendingPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Insight 3: Gap Financeiro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-4 rounded-2xl ${hasDebt ? 'bg-red-500/10' : 'bg-green-500/10'} border border-white/5`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${hasDebt ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    <Wallet className={`w-5 h-5 ${hasDebt ? 'text-red-400' : 'text-green-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm mb-1">Gap Financeiro</h3>
                    {hasDebt ? (
                      <>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-red-400">
                            -{formatCurrency(financialGap)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">
                          Você está devendo este valor. Tente reduzir gastos para equilibrar as contas.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-green-400">
                            {formatCurrency(currentBalance)}
                          </span>
                          <span className="text-gray-500 text-sm">disponível</span>
                        </div>
                        <p className="text-gray-400 text-xs">
                          Parabéns! Você não tem dívidas e possui saldo positivo! 🎉
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Insight 4: Categoria com mais gastos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-2xl bg-purple-500/10 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20">
                    <PiggyBank className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm mb-1">Categoria com Mais Gastos</h3>
                    {topCategory ? (
                      <>
                        <div className="mb-2">
                          <span className="text-xl font-bold text-purple-400">
                            {topCategory.category.name}
                          </span>
                          <p className="text-gray-500 text-xs">
                            {topCategory.count} transaç{topCategory.count !== 1 ? 'ões' : 'ão'}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            {formatCurrency(topCategory.total)}
                          </span>
                          <span className="text-gray-500 text-xs">
                            ({((topCategory.total / totalExpensesThisMonth) * 100).toFixed(0)}% do total)
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-sm">Nenhum gasto registrado este mês</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Insight 5: Progresso nas Metas - SIMPLIFICADO */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-2xl bg-cyan-500/10 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20">
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm mb-1">Progresso nas Metas</h3>
                    {goals.length > 0 ? (
                      <>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-cyan-400">
                            {goalsProgress.percentage.toFixed(0)}%
                          </span>
                          <span className="text-gray-500 text-sm">média de progresso</span>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goalsProgress.percentage}%` }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          />
                        </div>
                        
                        <p className="text-gray-400 text-sm">
                          {goalsProgress.total} meta{goalsProgress.total !== 1 ? 's' : ''} ativa{goalsProgress.total !== 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400 text-sm">Nenhuma meta criada ainda. Que tal começar?</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MascotInsights;
