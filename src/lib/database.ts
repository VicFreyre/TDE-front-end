import Dexie, { Table } from 'dexie';
import { Category, Expense, Goal, Income } from './store';

export interface WishboardDatabase {
  categories: Table<Category>;
  expenses: Table<Expense>;
  goals: Table<Goal>;
  incomes: Table<Income>;
  settings: Table<{ key: string; value: any }>;
}

class WishboardDB extends Dexie implements WishboardDatabase {
  categories!: Table<Category>;
  expenses!: Table<Expense>;
  goals!: Table<Goal>;
  incomes!: Table<Income>;
  settings!: Table<{ key: string; value: any }>;

  constructor() {
    super('WishboardDB');
    
    this.version(1).stores({
      categories: 'id, name',
      expenses: 'id, date, categoryId, paymentMethod',
      goals: 'id, name',
      incomes: 'id, date',
      settings: 'key',
    });
  }
}

export const db = new WishboardDB();

// Helper functions for database operations
export const dbHelpers = {
  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.categories.toArray();
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  },

  async addCategory(category: Category): Promise<void> {
    await db.categories.put(category);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await db.categories.update(id, updates);
  },

  async deleteCategory(id: string): Promise<void> {
    await db.categories.delete(id);
  },

  // Expenses
  async getAllExpenses(): Promise<Expense[]> {
    return await db.expenses.toArray();
  },

  async getExpenseById(id: string): Promise<Expense | undefined> {
    return await db.expenses.get(id);
  },

  async addExpense(expense: Expense): Promise<void> {
    await db.expenses.put(expense);
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    await db.expenses.update(id, updates);
  },

  async deleteExpense(id: string): Promise<void> {
    await db.expenses.delete(id);
  },

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db.expenses
      .where('date')
      .between(startDate.toISOString(), endDate.toISOString(), true, true)
      .toArray();
  },

  // Goals
  async getAllGoals(): Promise<Goal[]> {
    return await db.goals.toArray();
  },

  async getGoalById(id: string): Promise<Goal | undefined> {
    return await db.goals.get(id);
  },

  async addGoal(goal: Goal): Promise<void> {
    await db.goals.put(goal);
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    await db.goals.update(id, updates);
  },

  async deleteGoal(id: string): Promise<void> {
    await db.goals.delete(id);
  },

  // Incomes
  async getAllIncomes(): Promise<Income[]> {
    return await db.incomes.toArray();
  },

  async getIncomeById(id: string): Promise<Income | undefined> {
    return await db.incomes.get(id);
  },

  async addIncome(income: Income): Promise<void> {
    await db.incomes.put(income);
  },

  async deleteIncome(id: string): Promise<void> {
    await db.incomes.delete(id);
  },

  // Settings
  async getSetting(key: string): Promise<any> {
    const setting = await db.settings.get(key);
    return setting?.value;
  },

  async setSetting(key: string, value: any): Promise<void> {
    await db.settings.put({ key, value });
  },

  async deleteSetting(key: string): Promise<void> {
    await db.settings.delete(key);
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await db.categories.clear();
    await db.expenses.clear();
    await db.goals.clear();
    await db.incomes.clear();
    await db.settings.clear();
  },
};

