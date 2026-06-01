// ============================================
// SUPABASE STORE - VERSÃO SEGURA E VALIDADA
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { supabase, requireUserId } from './supabase';
import { 
  validateOrThrow,
  categorySchema,
  expenseSchema,
  goalSchema,
  incomeSchema,
  createCategorySchema,
  createExpenseSchema,
  createGoalSchema,
  createIncomeSchema,
  updateCategorySchema,
  updateExpenseSchema,
  updateGoalSchema,
  sanitizeString,
  normalizeMoneyValue,
  DatabaseError,
  AuthError,
} from './validators';
import type { 
  Category, 
  Expense, 
  Goal, 
  Income, 
  WishboardData,
  PaymentMethod,
  DbCategory,
  DbExpense,
  DbGoal,
  DbIncome,
  DbSettings,
  mapDbCategoryToCategory,
  mapDbExpenseToExpense,
  mapDbGoalToGoal,
  mapDbIncomeToIncome,
} from '@/types';

// ============================================
// TIPOS LOCAIS (compatibilidade)
// ============================================

export type { Category, Expense, Goal, Income, WishboardData, PaymentMethod };

// ============================================
// HELPERS DE MAPEAMENTO
// ============================================

const mapCategory = (db: DbCategory): Category => ({
  id: db.id,
  name: db.name,
  icon: db.icon,
  color: db.color,
});

const mapExpense = (db: DbExpense): Expense => ({
  id: db.id,
  amount: db.amount,
  date: db.date,
  categoryId: db.category_id,
  description: db.description,
  paymentMethod: db.payment_method || 'debit',
});

const mapGoal = (db: DbGoal): Goal => ({
  id: db.id,
  name: db.name,
  icon: db.icon,
  targetAmount: db.target_amount,
  savedAmount: db.saved_amount,
  deadline: db.deadline,
  color: db.color,
});

const mapIncome = (db: DbIncome): Income => ({
  id: db.id,
  amount: db.amount,
  date: db.date,
  description: db.description,
});

// ============================================
// GERAÇÃO DE IDs SEGUROS
// ============================================

export const generateId = (): string => uuidv4();

// ============================================
// DADOS VAZIOS
// ============================================

const EMPTY_DATA: WishboardData = {
  categories: [],
  expenses: [],
  goals: [],
  incomes: [],
  monthlyBudget: 0,
  currentBalance: 0,
};

// ============================================
// LOAD DATA
// ============================================

export const loadDataFromSupabase = async (): Promise<WishboardData> => {
  if (!supabase) {
    if (import.meta.env.DEV) {
      console.warn('Supabase não configurado');
    }
    return EMPTY_DATA;
  }

  try {
    const userId = await requireUserId();
    
    // Carregar todos os dados em paralelo
    const [categoriesResult, expensesResult, goalsResult, incomesResult, settingsResult] = 
      await Promise.allSettled([
        supabase.from('categories').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('incomes').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('settings').select('*').eq('user_id', userId).single(),
      ]);

    // Processar resultados com tratamento de erro granular
    const categories: Category[] = categoriesResult.status === 'fulfilled' && !categoriesResult.value.error
      ? (categoriesResult.value.data || []).map(mapCategory)
      : [];

    const expenses: Expense[] = expensesResult.status === 'fulfilled' && !expensesResult.value.error
      ? (expensesResult.value.data || []).map(mapExpense)
      : [];

    const goals: Goal[] = goalsResult.status === 'fulfilled' && !goalsResult.value.error
      ? (goalsResult.value.data || []).map(mapGoal)
      : [];

    const incomes: Income[] = incomesResult.status === 'fulfilled' && !incomesResult.value.error
      ? (incomesResult.value.data || []).map(mapIncome)
      : [];

    const settings = settingsResult.status === 'fulfilled' && !settingsResult.value.error
      ? settingsResult.value.data as DbSettings
      : { monthly_budget: 0, current_balance: 0 };

    return {
      categories,
      expenses,
      goals,
      incomes,
      monthlyBudget: settings?.monthly_budget ?? 0,
      currentBalance: settings?.current_balance ?? 0,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new DatabaseError(
      'Erro ao carregar dados',
      'LOAD_ERROR',
      error
    );
  }
};

// ============================================
// SAVE DATA
// ============================================

export const saveDataToSupabase = async (data: WishboardData): Promise<void> => {
  if (!supabase) {
    throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
  }

  try {
    const userId = await requireUserId();

    const results = await Promise.allSettled([
      // Categories
      data.categories.length > 0
        ? supabase.from('categories').upsert(
            data.categories.map(cat => ({
              id: cat.id,
              user_id: userId,
              name: sanitizeString(cat.name, 100),
              icon: sanitizeString(cat.icon, 50),
              color: cat.color,
            })),
            { onConflict: 'id' }
          )
        : Promise.resolve({ error: null }),
        
      // Expenses
      data.expenses.length > 0
        ? supabase.from('expenses').upsert(
            data.expenses.map(exp => ({
              id: exp.id,
              user_id: userId,
              amount: normalizeMoneyValue(exp.amount),
              date: exp.date,
              category_id: exp.categoryId,
              description: sanitizeString(exp.description || '', 500),
              payment_method: exp.paymentMethod,
            })),
            { onConflict: 'id' }
          )
        : Promise.resolve({ error: null }),
        
      // Goals
      data.goals.length > 0
        ? supabase.from('goals').upsert(
            data.goals.map(goal => ({
              id: goal.id,
              user_id: userId,
              name: sanitizeString(goal.name, 100),
              icon: sanitizeString(goal.icon, 50),
              target_amount: normalizeMoneyValue(goal.targetAmount),
              saved_amount: normalizeMoneyValue(goal.savedAmount),
              deadline: goal.deadline,
              color: goal.color,
            })),
            { onConflict: 'id' }
          )
        : Promise.resolve({ error: null }),
        
      // Incomes
      data.incomes.length > 0
        ? supabase.from('incomes').upsert(
            data.incomes.map(inc => ({
              id: inc.id,
              user_id: userId,
              amount: normalizeMoneyValue(inc.amount),
              date: inc.date,
              description: sanitizeString(inc.description || '', 500),
            })),
            { onConflict: 'id' }
          )
        : Promise.resolve({ error: null }),
        
      // Settings
      supabase.from('settings').upsert(
        {
          user_id: userId,
          monthly_budget: normalizeMoneyValue(data.monthlyBudget),
          current_balance: normalizeMoneyValue(data.currentBalance),
        },
        { onConflict: 'user_id' }
      ),
    ]);

    // Verificar erros
    const errors = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected'
    );
    
    if (errors.length > 0) {
      throw new DatabaseError(
        `${errors.length} operação(ões) falharam`,
        'PARTIAL_SAVE_ERROR'
      );
    }
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof AuthError) {
      throw error;
    }
    throw new DatabaseError('Erro ao salvar dados', 'SAVE_ERROR', error);
  }
};

// ============================================
// HELPERS INDIVIDUAIS
// ============================================

export const supabaseHelpers = {
  // ==========================================
  // CATEGORIES
  // ==========================================
  
  async getAllCategories(): Promise<Category[]> {
    if (!supabase) return [];
    const userId = await requireUserId();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao buscar categorias', 'FETCH_ERROR', error);
    return (data || []).map(mapCategory);
  },

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const newCategory: Category = {
      ...category,
      id: generateId(),
    };
    
    const { error } = await supabase.from('categories').insert({
      id: newCategory.id,
      user_id: userId,
      name: sanitizeString(newCategory.name, 100),
      icon: sanitizeString(newCategory.icon, 50),
      color: newCategory.color,
    });
    
    if (error) throw new DatabaseError('Erro ao criar categoria', 'INSERT_ERROR', error);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = sanitizeString(updates.name, 100);
    if (updates.icon !== undefined) dbUpdates.icon = sanitizeString(updates.icon, 50);
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    
    const { error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao atualizar categoria', 'UPDATE_ERROR', error);
  },

  async deleteCategory(id: string): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao deletar categoria', 'DELETE_ERROR', error);
  },

  // ==========================================
  // EXPENSES
  // ==========================================
  
  async getAllExpenses(): Promise<Expense[]> {
    if (!supabase) return [];
    const userId = await requireUserId();
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) throw new DatabaseError('Erro ao buscar despesas', 'FETCH_ERROR', error);
    return (data || []).map(mapExpense);
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      amount: normalizeMoneyValue(expense.amount),
    };
    
    const { error } = await supabase.from('expenses').insert({
      id: newExpense.id,
      user_id: userId,
      amount: newExpense.amount,
      date: newExpense.date,
      category_id: newExpense.categoryId,
      description: sanitizeString(newExpense.description || '', 500),
      payment_method: newExpense.paymentMethod,
    });
    
    if (error) throw new DatabaseError('Erro ao criar despesa', 'INSERT_ERROR', error);
    return newExpense;
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const dbUpdates: Record<string, unknown> = {};
    if (updates.amount !== undefined) dbUpdates.amount = normalizeMoneyValue(updates.amount);
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.description !== undefined) dbUpdates.description = sanitizeString(updates.description, 500);
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    
    const { error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao atualizar despesa', 'UPDATE_ERROR', error);
  },

  async deleteExpense(id: string): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao deletar despesa', 'DELETE_ERROR', error);
  },

  // ==========================================
  // GOALS
  // ==========================================
  
  async getAllGoals(): Promise<Goal[]> {
    if (!supabase) return [];
    const userId = await requireUserId();
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao buscar metas', 'FETCH_ERROR', error);
    return (data || []).map(mapGoal);
  },

  async addGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      targetAmount: normalizeMoneyValue(goal.targetAmount),
      savedAmount: normalizeMoneyValue(goal.savedAmount),
    };
    
    const { error } = await supabase.from('goals').insert({
      id: newGoal.id,
      user_id: userId,
      name: sanitizeString(newGoal.name, 100),
      icon: sanitizeString(newGoal.icon, 50),
      target_amount: newGoal.targetAmount,
      saved_amount: newGoal.savedAmount,
      deadline: newGoal.deadline,
      color: newGoal.color,
    });
    
    if (error) throw new DatabaseError('Erro ao criar meta', 'INSERT_ERROR', error);
    return newGoal;
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = sanitizeString(updates.name, 100);
    if (updates.icon !== undefined) dbUpdates.icon = sanitizeString(updates.icon, 50);
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = normalizeMoneyValue(updates.targetAmount);
    if (updates.savedAmount !== undefined) dbUpdates.saved_amount = normalizeMoneyValue(updates.savedAmount);
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    
    const { error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao atualizar meta', 'UPDATE_ERROR', error);
  },

  async deleteGoal(id: string): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao deletar meta', 'DELETE_ERROR', error);
  },

  // ==========================================
  // INCOMES
  // ==========================================
  
  async getAllIncomes(): Promise<Income[]> {
    if (!supabase) return [];
    const userId = await requireUserId();
    
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) throw new DatabaseError('Erro ao buscar receitas', 'FETCH_ERROR', error);
    return (data || []).map(mapIncome);
  },

  async addIncome(income: Omit<Income, 'id'>): Promise<Income> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const newIncome: Income = {
      ...income,
      id: generateId(),
      amount: normalizeMoneyValue(income.amount),
    };
    
    const { error } = await supabase.from('incomes').insert({
      id: newIncome.id,
      user_id: userId,
      amount: newIncome.amount,
      date: newIncome.date,
      description: sanitizeString(newIncome.description || '', 500),
    });
    
    if (error) throw new DatabaseError('Erro ao criar receita', 'INSERT_ERROR', error);
    return newIncome;
  },

  async deleteIncome(id: string): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError('Erro ao deletar receita', 'DELETE_ERROR', error);
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  
  async getSettings(): Promise<{ monthlyBudget: number; currentBalance: number }> {
    if (!supabase) return { monthlyBudget: 0, currentBalance: 0 };
    const userId = await requireUserId();
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new DatabaseError('Erro ao buscar configurações', 'FETCH_ERROR', error);
    }
    
    return {
      monthlyBudget: data?.monthly_budget ?? 0,
      currentBalance: data?.current_balance ?? 0,
    };
  },

  async setSetting(key: 'monthlyBudget' | 'currentBalance', value: number): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const dbKey = key === 'monthlyBudget' ? 'monthly_budget' : 'current_balance';
    
    const { error } = await supabase.from('settings').upsert(
      {
        user_id: userId,
        [dbKey]: normalizeMoneyValue(value),
      },
      { onConflict: 'user_id' }
    );
    
    if (error) throw new DatabaseError('Erro ao salvar configuração', 'UPDATE_ERROR', error);
  },

  async updateSettings(settings: { monthlyBudget?: number; currentBalance?: number }): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const updates: Record<string, number> = {};
    if (settings.monthlyBudget !== undefined) {
      updates.monthly_budget = normalizeMoneyValue(settings.monthlyBudget);
    }
    if (settings.currentBalance !== undefined) {
      updates.current_balance = normalizeMoneyValue(settings.currentBalance);
    }
    
    const { error } = await supabase.from('settings').upsert(
      { user_id: userId, ...updates },
      { onConflict: 'user_id' }
    );
    
    if (error) throw new DatabaseError('Erro ao salvar configurações', 'UPDATE_ERROR', error);
  },

  // ==========================================
  // BATCH IMPORT (importação em lote)
  // ==========================================

  async batchAddCategories(categoriesData: Array<Omit<Category, 'id'>>): Promise<Category[]> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    if (categoriesData.length === 0) return [];
    
    const userId = await requireUserId();
    
    const newCategories: Category[] = categoriesData.map(cat => ({
      ...cat,
      id: generateId(),
    }));
    
    const { error } = await supabase.from('categories').insert(
      newCategories.map(cat => ({
        id: cat.id,
        user_id: userId,
        name: sanitizeString(cat.name, 100),
        icon: sanitizeString(cat.icon, 50),
        color: cat.color,
      }))
    );
    
    if (error) throw new DatabaseError('Erro ao criar categorias em lote', 'INSERT_ERROR', error);
    return newCategories;
  },

  async batchAddExpenses(expensesData: Array<Omit<Expense, 'id'>>): Promise<Expense[]> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    if (expensesData.length === 0) return [];
    
    const userId = await requireUserId();
    
    const newExpenses: Expense[] = expensesData.map(exp => ({
      ...exp,
      id: generateId(),
      amount: normalizeMoneyValue(exp.amount),
    }));
    
    const { error } = await supabase.from('expenses').insert(
      newExpenses.map(exp => ({
        id: exp.id,
        user_id: userId,
        amount: exp.amount,
        date: exp.date,
        category_id: exp.categoryId,
        description: sanitizeString(exp.description || '', 500),
        payment_method: exp.paymentMethod,
      }))
    );
    
    if (error) {
      console.error('Supabase error (expenses):', error);
      throw new DatabaseError(`Erro ao criar despesas: ${error.message}`, 'INSERT_ERROR', error);
    }
    return newExpenses;
  },

  async batchAddIncomes(incomesData: Array<Omit<Income, 'id'>>): Promise<Income[]> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    if (incomesData.length === 0) return [];
    
    const userId = await requireUserId();
    
    const newIncomes: Income[] = incomesData.map(inc => ({
      ...inc,
      id: generateId(),
      amount: normalizeMoneyValue(inc.amount),
    }));
    
    const { error } = await supabase.from('incomes').insert(
      newIncomes.map(inc => ({
        id: inc.id,
        user_id: userId,
        amount: inc.amount,
        date: inc.date,
        description: sanitizeString(inc.description || '', 500),
      }))
    );
    
    if (error) {
      console.error('Supabase error (incomes):', error);
      throw new DatabaseError(`Erro ao criar receitas: ${error.message}`, 'INSERT_ERROR', error);
    }
    return newIncomes;
  },

  async batchAddGoals(goalsData: Array<Omit<Goal, 'id'>>): Promise<Goal[]> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    if (goalsData.length === 0) return [];
    
    const userId = await requireUserId();
    
    const newGoals: Goal[] = goalsData.map(goal => ({
      ...goal,
      id: generateId(),
      targetAmount: normalizeMoneyValue(goal.targetAmount),
      savedAmount: normalizeMoneyValue(goal.savedAmount),
    }));
    
    const { error } = await supabase.from('goals').insert(
      newGoals.map(goal => ({
        id: goal.id,
        user_id: userId,
        name: sanitizeString(goal.name, 100),
        icon: sanitizeString(goal.icon, 50),
        target_amount: goal.targetAmount,
        saved_amount: goal.savedAmount,
        deadline: goal.deadline,
        color: goal.color,
      }))
    );
    
    if (error) throw new DatabaseError('Erro ao criar metas em lote', 'INSERT_ERROR', error);
    return newGoals;
  },

  // ==========================================
  // CLEAR ALL (com confirmação)
  // ==========================================
  
  async clearAll(): Promise<void> {
    if (!supabase) throw new DatabaseError('Supabase não configurado', 'NO_SUPABASE');
    const userId = await requireUserId();
    
    const results = await Promise.allSettled([
      supabase.from('expenses').delete().eq('user_id', userId),
      supabase.from('incomes').delete().eq('user_id', userId),
      supabase.from('goals').delete().eq('user_id', userId),
      supabase.from('categories').delete().eq('user_id', userId),
      supabase.from('settings').delete().eq('user_id', userId),
    ]);
    
    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      throw new DatabaseError('Erro ao limpar dados', 'DELETE_ERROR');
    }
  },
};

// ============================================
// FORMATADORES (compatibilidade)
// ============================================

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    debit: 'Débito',
    credit: 'Crédito',
    cash: 'Espécie',
  };
  return labels[method];
};

export const getPaymentMethodColor = (method: PaymentMethod): string => {
  const colors: Record<PaymentMethod, string> = {
    debit: 'hsl(211, 96%, 48%)',
    credit: 'hsl(262, 83%, 58%)',
    cash: 'hsl(142, 72%, 45%)',
  };
  return colors[method];
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateString));
};

export const formatFullDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};

// ============================================
// EXPORTS PARA COMPATIBILIDADE
// ============================================

export const loadData = loadDataFromSupabase;
export const saveData = saveDataToSupabase;
