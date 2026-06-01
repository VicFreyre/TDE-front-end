// ============================================
// HOOK WISHBOARD - VERSÃO REFATORADA
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification, NOTIFICATION_MESSAGES } from '@/hooks/useNotification';
import { 
  loadDataFromSupabase, 
  supabaseHelpers,
  generateId,
} from '@/lib/supabaseStore';
import { normalizeMoneyValue } from '@/lib/validators';
import type { 
  WishboardData, 
  Category, 
  Expense, 
  Goal,
  Income,
  CreateExpenseInput,
  CreateIncomeInput,
  CreateGoalInput,
  CreateCategoryInput,
} from '@/types';

// ============================================
// TIPOS
// ============================================

interface UseWishboardReturn {
  // Dados
  data: WishboardData;
  categories: Category[];
  expenses: Expense[];
  goals: Goal[];
  incomes: Income[];
  monthlyBudget: number;
  currentBalance: number;
  
  // Estados
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Operações de Despesas
  addExpense: (expense: CreateExpenseInput) => Promise<boolean>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  
  // Operações de Receitas
  addIncome: (income: CreateIncomeInput) => Promise<boolean>;
  deleteIncome: (id: string) => Promise<boolean>;
  
  // Operações de Metas
  addGoal: (goal: CreateGoalInput) => Promise<boolean>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  
  // Operações de Categorias
  addCategory: (category: CreateCategoryInput) => Promise<boolean>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // Configurações
  updateBudget: (budget: number) => Promise<boolean>;
  updateBalance: (balance: number) => Promise<boolean>;
  
  // Utilitários
  getMonthlyExpenses: (year: number, month: number) => Expense[];
  getYearlyExpenses: (year: number) => Expense[];
  getCategoryById: (id: string) => Category | undefined;
  getExpensesByCategory: (expenses: Expense[]) => Array<{ category: Category; total: number; count: number }>;
  getExpensesByPaymentMethod: (expenses: Expense[]) => Record<string, number>;
  
  // Admin
  clearAllData: () => Promise<boolean>;
  refreshData: () => Promise<void>;
}

// ============================================
// DADOS INICIAIS
// ============================================

const INITIAL_DATA: WishboardData = {
  categories: [],
  expenses: [],
  goals: [],
  incomes: [],
  monthlyBudget: 0,
  currentBalance: 0,
};

// ============================================
// HOOK
// ============================================

export const useWishboard = (): UseWishboardReturn => {
  const { isAuthenticated } = useAuth();
  const { success, error: notifyError } = useNotification();
  
  // Estados
  const [data, setData] = useState<WishboardData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // CARREGAR DADOS
  // ==========================================
  
  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setData(INITIAL_DATA);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedData = await loadDataFromSupabase();
      setData(loadedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
      notifyError(NOTIFICATION_MESSAGES.system.syncError.title, message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, notifyError]);

  // Carregar dados quando autenticar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // OPERAÇÕES COM TRATAMENTO DE ERRO
  // ==========================================
  
  const executeOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    successMessage: { title: string; message?: string },
    errorMessage: { title: string; message?: string },
  ): Promise<{ success: boolean; result?: T }> => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await operation();
      success(successMessage.title, successMessage.message);
      return { success: true, result };
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage.message || 'Erro desconhecido';
      setError(message);
      notifyError(errorMessage.title, message);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, [success, notifyError]);

  // ==========================================
  // DESPESAS
  // ==========================================

  const addExpense = useCallback(async (expense: CreateExpenseInput): Promise<boolean> => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      amount: normalizeMoneyValue(expense.amount),
    };

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.addExpense(expense);
        const newBalance = data.currentBalance - newExpense.amount;
        await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        setData(prev => ({
          ...prev,
          expenses: [newExpense, ...prev.expenses],
          currentBalance: newBalance,
        }));
      },
      NOTIFICATION_MESSAGES.expense.added,
      NOTIFICATION_MESSAGES.expense.error,
    );

    return isSuccess;
  }, [executeOperation, data.currentBalance]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>): Promise<boolean> => {
    const oldExpense = data.expenses.find(e => e.id === id);
    const amountDiff = oldExpense && updates.amount !== undefined 
      ? oldExpense.amount - normalizeMoneyValue(updates.amount)
      : 0;

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.updateExpense(id, updates);
        if (amountDiff !== 0) {
          const newBalance = data.currentBalance + amountDiff;
          await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        }
        setData(prev => ({
          ...prev,
          expenses: prev.expenses.map(e => 
            e.id === id ? { ...e, ...updates } : e
          ),
          currentBalance: prev.currentBalance + amountDiff,
        }));
      },
      NOTIFICATION_MESSAGES.expense.updated,
      NOTIFICATION_MESSAGES.expense.error,
    );

    return isSuccess;
  }, [executeOperation, data.expenses, data.currentBalance]);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    const expense = data.expenses.find(e => e.id === id);
    const amountToRestore = expense?.amount || 0;

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.deleteExpense(id);
        if (amountToRestore > 0) {
          const newBalance = data.currentBalance + amountToRestore;
          await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        }
        setData(prev => ({
          ...prev,
          expenses: prev.expenses.filter(e => e.id !== id),
          currentBalance: prev.currentBalance + amountToRestore,
        }));
      },
      NOTIFICATION_MESSAGES.expense.deleted,
      NOTIFICATION_MESSAGES.expense.error,
    );

    return isSuccess;
  }, [executeOperation, data.expenses, data.currentBalance]);

  // ==========================================
  // RECEITAS
  // ==========================================

  const addIncome = useCallback(async (income: CreateIncomeInput): Promise<boolean> => {
    const newIncome: Income = {
      ...income,
      id: generateId(),
      amount: normalizeMoneyValue(income.amount),
    };

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.addIncome(income);
        const newBalance = data.currentBalance + newIncome.amount;
        await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        setData(prev => ({
          ...prev,
          incomes: [newIncome, ...prev.incomes],
          currentBalance: newBalance,
        }));
      },
      NOTIFICATION_MESSAGES.income.added,
      NOTIFICATION_MESSAGES.income.error,
    );

    return isSuccess;
  }, [executeOperation, data.currentBalance]);

  const deleteIncome = useCallback(async (id: string): Promise<boolean> => {
    const income = data.incomes.find(i => i.id === id);
    const amountToRemove = income?.amount || 0;

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.deleteIncome(id);
        if (amountToRemove > 0) {
          const newBalance = data.currentBalance - amountToRemove;
          await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        }
        setData(prev => ({
          ...prev,
          incomes: prev.incomes.filter(i => i.id !== id),
          currentBalance: prev.currentBalance - amountToRemove,
        }));
      },
      NOTIFICATION_MESSAGES.income.deleted,
      NOTIFICATION_MESSAGES.income.error,
    );

    return isSuccess;
  }, [executeOperation, data.incomes, data.currentBalance]);

  // ==========================================
  // METAS
  // ==========================================

  const addGoal = useCallback(async (goal: CreateGoalInput): Promise<boolean> => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      targetAmount: normalizeMoneyValue(goal.targetAmount),
      savedAmount: normalizeMoneyValue(goal.savedAmount),
    };

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.addGoal(goal);
        if (newGoal.savedAmount > 0) {
          const newBalance = data.currentBalance - newGoal.savedAmount;
          await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        }
        setData(prev => ({
          ...prev,
          goals: [...prev.goals, newGoal],
          currentBalance: prev.currentBalance - newGoal.savedAmount,
        }));
      },
      NOTIFICATION_MESSAGES.goal.added,
      NOTIFICATION_MESSAGES.goal.error,
    );

    return isSuccess;
  }, [executeOperation, data.currentBalance]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>): Promise<boolean> => {
    const oldGoal = data.goals.find(g => g.id === id);
    if (!oldGoal) return false;

    const oldSavedAmount = oldGoal.savedAmount;
    const newSavedAmount = updates.savedAmount !== undefined 
      ? normalizeMoneyValue(updates.savedAmount) 
      : oldSavedAmount;
    const savedAmountDiff = newSavedAmount - oldSavedAmount;

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.updateGoal(id, updates);
        if (savedAmountDiff !== 0) {
          const newBalance = data.currentBalance - savedAmountDiff;
          await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        }

        // Verificar se a meta foi alcançada
        const updatedGoal = { ...oldGoal, ...updates };
        if (updatedGoal.savedAmount >= updatedGoal.targetAmount && oldGoal.savedAmount < oldGoal.targetAmount) {
          success(NOTIFICATION_MESSAGES.goal.completed.title, NOTIFICATION_MESSAGES.goal.completed.message);
        }

        setData(prev => ({
          ...prev,
          goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g),
          currentBalance: prev.currentBalance - savedAmountDiff,
        }));
      },
      NOTIFICATION_MESSAGES.goal.updated,
      NOTIFICATION_MESSAGES.goal.error,
    );

    return isSuccess;
  }, [executeOperation, data.goals, data.currentBalance, success]);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    const goal = data.goals.find(g => g.id === id);
    const savedToRestore = goal?.savedAmount || 0;

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.deleteGoal(id);
        if (savedToRestore > 0) {
          const newBalance = data.currentBalance + savedToRestore;
          await supabaseHelpers.updateSettings({ currentBalance: newBalance });
        }
        setData(prev => ({
          ...prev,
          goals: prev.goals.filter(g => g.id !== id),
          currentBalance: prev.currentBalance + savedToRestore,
        }));
      },
      NOTIFICATION_MESSAGES.goal.deleted,
      NOTIFICATION_MESSAGES.goal.error,
    );

    return isSuccess;
  }, [executeOperation, data.goals, data.currentBalance]);

  // ==========================================
  // CATEGORIAS
  // ==========================================

  const addCategory = useCallback(async (category: CreateCategoryInput): Promise<boolean> => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    };

    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.addCategory(category);
        setData(prev => ({
          ...prev,
          categories: [...prev.categories, newCategory],
        }));
      },
      NOTIFICATION_MESSAGES.category.added,
      NOTIFICATION_MESSAGES.category.error,
    );

    return isSuccess;
  }, [executeOperation]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>): Promise<boolean> => {
    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.updateCategory(id, updates);
        setData(prev => ({
          ...prev,
          categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c),
        }));
      },
      NOTIFICATION_MESSAGES.category.updated,
      NOTIFICATION_MESSAGES.category.error,
    );

    return isSuccess;
  }, [executeOperation]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.deleteCategory(id);
        setData(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c.id !== id),
        }));
      },
      NOTIFICATION_MESSAGES.category.deleted,
      NOTIFICATION_MESSAGES.category.error,
    );

    return isSuccess;
  }, [executeOperation]);

  // ==========================================
  // CONFIGURAÇÕES
  // ==========================================

  const updateBudget = useCallback(async (budget: number): Promise<boolean> => {
    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.setSetting('monthlyBudget', budget);
        setData(prev => ({ ...prev, monthlyBudget: normalizeMoneyValue(budget) }));
      },
      { title: 'Orçamento atualizado' },
      { title: 'Erro ao atualizar orçamento' },
    );

    return isSuccess;
  }, [executeOperation]);

  const updateBalance = useCallback(async (balance: number): Promise<boolean> => {
    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.setSetting('currentBalance', balance);
        setData(prev => ({ ...prev, currentBalance: normalizeMoneyValue(balance) }));
      },
      { title: 'Saldo atualizado' },
      { title: 'Erro ao atualizar saldo' },
    );

    return isSuccess;
  }, [executeOperation]);

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const getMonthlyExpenses = useCallback((year: number, month: number): Expense[] => {
    return data.expenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [data.expenses]);

  const getYearlyExpenses = useCallback((year: number): Expense[] => {
    return data.expenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === year;
    });
  }, [data.expenses]);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return data.categories.find(c => c.id === id);
  }, [data.categories]);

  const getExpensesByCategory = useCallback((expenses: Expense[]): Array<{ category: Category; total: number; count: number }> => {
    const grouped: Record<string, { category: Category; total: number; count: number }> = {};
    
    expenses.forEach(expense => {
      const category = getCategoryById(expense.categoryId);
      if (category) {
        if (!grouped[category.id]) {
          grouped[category.id] = { category, total: 0, count: 0 };
        }
        grouped[category.id].total += expense.amount;
        grouped[category.id].count += 1;
      }
    });
    
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [getCategoryById]);

  const getExpensesByPaymentMethod = useCallback((expenses: Expense[]): Record<string, number> => {
    const grouped: Record<string, number> = { debit: 0, credit: 0, cash: 0 };
    expenses.forEach(expense => {
      grouped[expense.paymentMethod] = (grouped[expense.paymentMethod] || 0) + expense.amount;
    });
    return grouped;
  }, []);

  // ==========================================
  // ADMIN
  // ==========================================

  const clearAllData = useCallback(async (): Promise<boolean> => {
    const { success: isSuccess } = await executeOperation(
      async () => {
        await supabaseHelpers.clearAll();
        setData(INITIAL_DATA);
      },
      { title: 'Dados limpos', message: 'Todos os dados foram removidos' },
      { title: 'Erro ao limpar dados' },
    );

    return isSuccess;
  }, [executeOperation]);

  const refreshData = useCallback(async (): Promise<void> => {
    await loadData();
  }, [loadData]);

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // Dados
    data,
    categories: data.categories,
    expenses: data.expenses,
    goals: data.goals,
    incomes: data.incomes,
    monthlyBudget: data.monthlyBudget,
    currentBalance: data.currentBalance,
    
    // Estados
    isLoading,
    isSaving,
    error,
    
    // Operações
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    addGoal,
    updateGoal,
    deleteGoal,
    addCategory,
    updateCategory,
    deleteCategory,
    updateBudget,
    updateBalance,
    
    // Utilitários
    getMonthlyExpenses,
    getYearlyExpenses,
    getCategoryById,
    getExpensesByCategory,
    getExpensesByPaymentMethod,
    
    // Admin
    clearAllData,
    refreshData,
  };
};

export default useWishboard;
